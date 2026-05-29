import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { createRazorpayOrder } from "@/lib/razorpay";
import { getSubscriptionAmountPaise } from "@/lib/subscription";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  secureJsonResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-utils";
import {
  requireSession,
  requireMutationOrigin,
} from "@/lib/api-guard";
import {
  getMissingProfileFields,
  isProfileComplete,
  PROFILE_FIELD_LABELS,
} from "@/lib/user-profile";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";

export async function POST(request: Request) {
  const originBlock = requireMutationOrigin(request);
  if (originBlock) return originBlock;

  const session = await requireSession();
  if (session instanceof Response) return session;

  const ip = getClientIp(request);
  const limit = rateLimit(`create-order:${session.userId}:${ip}`, 5);
  if (!limit.success) {
    return errorResponse("Too many payment requests", 429);
  }

  try {
    await connectDB();

    const user = await User.findById(session.userId);
    if (!user) {
      return unauthorizedResponse();
    }

    if (!isProfileComplete(user)) {
      const missing = getMissingProfileFields(user);
      return secureJsonResponse(
        {
          error: "Complete your profile before purchasing mentorship access",
          code: "PROFILE_INCOMPLETE",
          missingFields: missing,
          missingLabels: missing.map((f) => PROFILE_FIELD_LABELS[f] || f),
        },
        400
      );
    }

    if (user.subscriptionStatus === "active" && user.subscriptionExpiry) {
      const expiry = new Date(user.subscriptionExpiry);
      if (expiry > new Date()) {
        return errorResponse(
          "You already have an active subscription",
          400
        );
      }
    }

    const amount = getSubscriptionAmountPaise();
    const receipt = `rcpt_${user._id.toString().slice(-8)}_${Date.now()}`;
    const idempotencyKey = crypto.randomUUID();

    const order = await createRazorpayOrder(amount, receipt, {
      userId: user._id.toString(),
      email: user.email,
    });

    await Payment.create({
      userId: user._id,
      razorpayOrderId: order.id,
      amount,
      currency: order.currency,
      status: "created",
      idempotencyKey,
    });

    user.paymentStatus = "pending";
    await user.save();

    return secureJsonResponse({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    return errorResponse("Failed to create payment order", 500);
  }
}
