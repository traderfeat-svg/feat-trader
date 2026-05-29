import { connectDB } from "@/lib/db";
import { verifyCronSecret } from "@/lib/api-utils";
import { fetchPayment } from "@/lib/razorpay";
import { fulfillPayment } from "@/lib/fulfillment";
import { Payment } from "@/models/Payment";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    const stalePayments = await Payment.find({
      status: { $in: ["created", "pending"] },
      createdAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    }).limit(50);

    let updated = 0;
    let failed = 0;

    for (const payment of stalePayments) {
      if (payment.razorpayPaymentId) {
        try {
          const rpPayment = await fetchPayment(payment.razorpayPaymentId);
          if (rpPayment.status === "captured") {
            await fulfillPayment(
              payment.razorpayOrderId,
              payment.razorpayPaymentId,
              payment.razorpaySignature || ""
            );
            updated++;
          } else if (rpPayment.status === "failed") {
            payment.status = "failed";
            await payment.save();
            failed++;
          }
        } catch {
          payment.status = "failed";
          await payment.save();
          failed++;
        }
      } else {
        payment.status = "failed";
        await payment.save();
        failed++;
      }
    }

    return NextResponse.json({
      success: true,
      checked: stalePayments.length,
      fulfilled: updated,
      markedFailed: failed,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Check payments cron error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
