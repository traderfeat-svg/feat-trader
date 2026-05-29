import {
  fetchPayment,
  fetchOrder,
  verifyPaymentSignature,
} from "@/lib/razorpay";
import type { IPayment } from "@/models/Payment";

export interface PaymentVerificationResult {
  valid: boolean;
  error?: string;
}

/**
 * Server-side Razorpay verification: signature + API fetch + amount/order/currency/status.
 * Must pass before fulfillPayment() runs.
 */
export async function verifyRazorpayPaymentForFulfillment(
  paymentRecord: Pick<IPayment, "razorpayOrderId" | "amount" | "currency">,
  razorpayPaymentId: string,
  razorpaySignature: string,
  options?: { skipSignatureCheck?: boolean }
): Promise<PaymentVerificationResult> {
  if (!options?.skipSignatureCheck) {
    const sigOk = verifyPaymentSignature(
      paymentRecord.razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
    if (!sigOk) {
      return { valid: false, error: "Invalid payment signature" };
    }
  }

  let rpPayment: Awaited<ReturnType<typeof fetchPayment>>;
  try {
    rpPayment = await fetchPayment(razorpayPaymentId);
  } catch (err) {
    console.error("[verifyRazorpayPayment] fetchPayment failed", err);
    return { valid: false, error: "Unable to verify payment with Razorpay" };
  }

  const status = (rpPayment as { status?: string }).status;
  if (status !== "captured") {
    return {
      valid: false,
      error: `Payment not captured (status: ${status || "unknown"})`,
    };
  }

  const rpOrderId = (rpPayment as { order_id?: string }).order_id;
  if (rpOrderId !== paymentRecord.razorpayOrderId) {
    return { valid: false, error: "Payment order mismatch" };
  }

  const rpAmount = Number((rpPayment as { amount?: number }).amount);
  if (rpAmount !== paymentRecord.amount) {
    return {
      valid: false,
      error: "Payment amount mismatch",
    };
  }

  const rpCurrency = (
    (rpPayment as { currency?: string }).currency || "INR"
  ).toUpperCase();
  const expectedCurrency = (paymentRecord.currency || "INR").toUpperCase();
  if (rpCurrency !== expectedCurrency) {
    return { valid: false, error: "Payment currency mismatch" };
  }

  try {
    const order = await fetchOrder(paymentRecord.razorpayOrderId);
    const orderStatus = (order as { status?: string }).status;
    if (orderStatus === "paid" || orderStatus === "attempted") {
      // paid = fully paid; attempted may still have captured payment — ok if payment captured
    }
    const orderAmount = Number((order as { amount?: number }).amount);
    if (orderAmount !== paymentRecord.amount) {
      return { valid: false, error: "Order amount mismatch" };
    }
  } catch (err) {
    console.error("[verifyRazorpayPayment] fetchOrder failed", err);
    // Payment fetch already validated; order fetch is extra hardening
  }

  return { valid: true };
}
