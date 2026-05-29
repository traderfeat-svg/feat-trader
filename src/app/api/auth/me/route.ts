import { connectDB } from "@/lib/db";
import {
  secureJsonResponse,
  unauthorizedResponse,
} from "@/lib/api-utils";
import { requireSession } from "@/lib/api-guard";
import { toPublicUser } from "@/lib/user-profile";
import { User } from "@/models/User";
import { InviteLink } from "@/models/InviteLink";

export async function GET() {
  const session = await requireSession();
  if (session instanceof Response) return session;

  await connectDB();

  const user = await User.findById(session.userId);
  if (!user) {
    return unauthorizedResponse();
  }

  const activeInvite = await InviteLink.findOne({
    userId: user._id,
    status: "active",
    expireDate: { $gt: new Date() },
  }).sort({ createdAt: -1 });

  return secureJsonResponse({
    user: toPublicUser(user),
    activeInvite: activeInvite
      ? {
          link: activeInvite.inviteLink,
          expiresAt: activeInvite.expireDate,
          status: activeInvite.status,
        }
      : null,
  });
}
