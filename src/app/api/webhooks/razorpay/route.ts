import { connectDB } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { verifyRazorpayPaymentForFulfillment } from "@/lib/payment-verify";
import { fulfillPayment } from "@/lib/fulfillment";
import { markWebhookEventProcessed } from "@/lib/webhook-events";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";

export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return errorResponse("Missing webhook signature", 400);
  }

  const rawBody = await request.text();

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.error("[razorpay-webhook] invalid signature");
    return errorResponse("Invalid webhook signature", 401);
  }

  try {
    const event = JSON.parse(rawBody);
    const eventType = event.event as string | undefined;
    const eventId =
      (event.id as string) ||
      `${eventType}-${event.payload?.payment?.entity?.id || Date.now()}`;

    const { duplicate } = await markWebhookEventProcessed("razorpay", eventId);
    if (duplicate) {
      return jsonResponse({ received: true, duplicate: true });
    }

    if (eventType === "payment.captured") {
      const paymentEntity = event.payload?.payment?.entity;
      if (!paymentEntity) {
        return jsonResponse({ received: true });
      }

      const orderId = paymentEntity.order_id as string;
      const paymentId = paymentEntity.id as string;
      const method = paymentEntity.method as string | undefined;

      await connectDB();

      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      if (!payment) {
        console.error(
          "[razorpay-webhook] payment record not found for order",
          orderId
        );
        return jsonResponse({ received: true });
      }

      if (payment.status === "paid") {
        return jsonResponse({ received: true, alreadyProcessed: true });
      }

      const verification = await verifyRazorpayPaymentForFulfillment(
        payment,
        paymentId,
        signature,
        { skipSignatureCheck: true }
      );

      if (!verification.valid) {
        console.error(
          "[razorpay-webhook] payment verification failed",
          verification.error
        );
        await Payment.findByIdAndUpdate(payment._id, {
          $set: {
            status: "pending",
            webhookReceived: true,
            fulfillmentLastError: verification.error,
          },
        });
        return jsonResponse({ received: true, verified: false });
      }

      payment.status = "pending";
      payment.webhookReceived = true;
      payment.razorpayPaymentId = paymentId;
      await payment.save();

      const result = await fulfillPayment(
        orderId,
        paymentId,
        signature,
        method
      );

      if (!result.success) {
        console.error("[razorpay-webhook] fulfillment failed", result.error);
      }

      return jsonResponse({ received: true, fulfilled: result.success });
    }

    if (eventType === "payment.failed") {
      const paymentEntity = event.payload?.payment?.entity;
      if (paymentEntity?.order_id) {
        await connectDB();
        const failedPayment = await Payment.findOneAndUpdate(
          { razorpayOrderId: paymentEntity.order_id },
          { status: "failed", webhookReceived: true },
          { new: true }
        );
        if (failedPayment?.userId) {
          await User.findByIdAndUpdate(failedPayment.userId, {
            paymentStatus: "failed",
          });
        }
      }
    }

    return jsonResponse({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return errorResponse("Webhook processing failed", 500);
  }
}
