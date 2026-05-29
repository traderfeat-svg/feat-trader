import { connectDB } from "@/lib/db";
import {
  secureJsonResponse,
  errorResponse,
} from "@/lib/api-utils";
import { requireAdmin, isValidObjectId } from "@/lib/api-guard";
import { toPublicUser } from "@/lib/user-profile";
import { User } from "@/models/User";
import { Payment } from "@/models/Payment";
import { SubscriptionHistory } from "@/models/SubscriptionHistory";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return errorResponse("Invalid user id", 400);
  }

  await connectDB();

  const user = await User.findById(id);
  if (!user) {
    return errorResponse("User not found", 404);
  }

  const [payments, subscriptionHistory] = await Promise.all([
    Payment.find({ userId: user._id })
      .select(
        "razorpayOrderId razorpayPaymentId amount currency status method createdAt processedAt"
      )
      .sort({ createdAt: -1 })
      .limit(50),
    SubscriptionHistory.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(20),
  ]);

  return secureJsonResponse({
    user: toPublicUser(user),
    payments: payments.map((p) => ({
      id: p._id.toString(),
      razorpayOrderId: p.razorpayOrderId,
      razorpayPaymentId: p.razorpayPaymentId,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      method: p.method,
      createdAt: p.createdAt,
      processedAt: p.processedAt,
    })),
    subscriptionHistory: subscriptionHistory.map((h) => ({
      id: h._id.toString(),
      action: h.action,
      startDate: h.startDate,
      endDate: h.endDate,
      notes: h.notes,
      createdAt: h.createdAt,
    })),
  });
}
