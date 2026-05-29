import { connectDB } from "@/lib/db";
import { secureJsonResponse } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/api-guard";
import { User } from "@/models/User";
import { Payment } from "@/models/Payment";
import { TelegramMember } from "@/models/TelegramMember";
import { InviteLink } from "@/models/InviteLink";

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  await connectDB();

  const now = new Date();

  const [
    totalUsers,
    activeSubscriptions,
    expiredSubscriptions,
    totalRevenue,
    activeMembers,
    usedInvites,
    pendingPayments,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({
      subscriptionStatus: "active",
      subscriptionExpiry: { $gt: now },
    }),
    User.countDocuments({
      $or: [
        { subscriptionStatus: "expired" },
        { subscriptionExpiry: { $lte: now } },
      ],
    }),
    Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    TelegramMember.countDocuments({ status: "active" }),
    InviteLink.countDocuments({ status: "used" }),
    Payment.countDocuments({ status: { $in: ["created", "pending"] } }),
  ]);

  return secureJsonResponse({
    totalUsers,
    activeSubscriptions,
    expiredSubscriptions,
    totalRevenue: totalRevenue[0]?.total || 0,
    activeMembers,
    usedInvites,
    pendingPayments,
  });
}
