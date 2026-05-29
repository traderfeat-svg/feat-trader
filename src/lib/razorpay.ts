import Razorpay from "razorpay";
import crypto from "crypto";

function getRazorpayInstance(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function createRazorpayOrder(
  amountPaise: number,
  receipt: string,
  notes?: Record<string, string>
) {
  const razorpay = getRazorpayInstance();

  const order = await razorpay.orders.create({
    amount: amountPaise,
    currency: process.env.SUBSCRIPTION_CURRENCY || "INR",
    receipt,
    notes: notes || {},
  });

  return order;
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  if (expected.length !== signature.length) return false;

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}

export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}

export async function fetchPayment(paymentId: string) {
  const razorpay = getRazorpayInstance();
  return razorpay.payments.fetch(paymentId);
}

export async function fetchOrder(orderId: string) {
  const razorpay = getRazorpayInstance();
  return razorpay.orders.fetch(orderId);
}
