import { z } from "zod";
import { connectDB } from "@/lib/db";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { verifyRazorpayPaymentForFulfillment } from "@/lib/payment-verify";
import { fulfillPayment } from "@/lib/fulfillment";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  secureJsonResponse,
  errorResponse,
  handleZodError,
} from "@/lib/api-utils";
import {
  requireSession,
  requireMutationOrigin,
} from "@/lib/api-guard";
import { Payment } from "@/models/Payment";

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1).max(100),
  razorpay_payment_id: z.string().min(1).max(100),
  razorpay_signature: z.string().min(1).max(256),
});

export async function POST(request: Request) {
  const originBlock = requireMutationOrigin(request);
  if (originBlock) return originBlock;

  const session = await requireSession();
  if (session instanceof Response) return session;

  const ip = getClientIp(request);
  const limit = rateLimit(`verify:${session.userId}:${ip}`, 8);
  if (!limit.success) {
    return errorResponse("Too many verification attempts", 429);
  }

  try {
    const body = await request.json();
    const data = verifySchema.parse(body);

    if (
      !verifyPaymentSignature(
        data.razorpay_order_id,
        data.razorpay_payment_id,
        data.razorpay_signature
      )
    ) {
      return errorResponse("Invalid payment signature", 400);
    }

    await connectDB();

    const payment = await Payment.findOne({
      razorpayOrderId: data.razorpay_order_id,
      userId: session.userId,
    });

    if (!payment) {
      return errorResponse("Payment not found", 404);
    }

    if (payment.status === "paid") {
      const result = await fulfillPayment(
        data.razorpay_order_id,
        data.razorpay_payment_id,
        data.razorpay_signature
      );
      return secureJsonResponse({
        success: true,
        alreadyProcessed: true,
        inviteLink: result.inviteLink,
        inviteExpiresAt: result.inviteExpiresAt,
      });
    }

    const verification = await verifyRazorpayPaymentForFulfillment(
      payment,
      data.razorpay_payment_id,
      data.razorpay_signature,
      { skipSignatureCheck: true }
    );

    if (!verification.valid) {
      console.error(
        "[payments/verify] Razorpay verification failed",
        verification.error
      );
      return errorResponse(
        verification.error || "Payment verification failed",
        400
      );
    }

    const result = await fulfillPayment(
      data.razorpay_order_id,
      data.razorpay_payment_id,
      data.razorpay_signature
    );

    if (!result.success) {
      return errorResponse(result.error || "Fulfillment failed", 500);
    }

    return secureJsonResponse({
      success: true,
      alreadyProcessed: result.alreadyProcessed,
      inviteLink: result.inviteLink,
      inviteExpiresAt: result.inviteExpiresAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }
    console.error("Verify payment error:", error);
    return errorResponse("Payment verification failed", 500);
  }
}
