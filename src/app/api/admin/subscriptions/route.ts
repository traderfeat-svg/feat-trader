import { connectDB } from "@/lib/db";
import { secureJsonResponse } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/api-guard";
import { User } from "@/models/User";
import { TelegramMember } from "@/models/TelegramMember";

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") || "active";

  await connectDB();

  const now = new Date();
  let query = {};

  if (filter === "active") {
    query = { subscriptionStatus: "active", subscriptionExpiry: { $gt: now } };
  } else if (filter === "expired") {
    query = {
      $or: [
        { subscriptionStatus: "expired" },
        { subscriptionExpiry: { $lte: now } },
      ],
    };
  }

  const users = await User.find(query)
    .sort({ subscriptionExpiry: 1 })
    .limit(200);

  const members = await TelegramMember.find({ status: "active" })
    .populate("userId", "email name")
    .limit(200);

  return secureJsonResponse({ users, members, filter });
}
