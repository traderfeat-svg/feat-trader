import { z } from "zod";
import { connectDB } from "@/lib/db";
import { createSingleUseInviteLink } from "@/lib/telegram";
import {
  secureJsonResponse,
  handleZodError,
  errorResponse,
} from "@/lib/api-utils";
import {
  requireAdmin,
  requireMutationOrigin,
  isValidObjectId,
} from "@/lib/api-guard";
import { User } from "@/models/User";
import { InviteLink } from "@/models/InviteLink";

const schema = z.object({ userId: z.string() }).strict();

export async function POST(request: Request) {
  const originBlock = requireMutationOrigin(request);
  if (originBlock) return originBlock;

  const session = await requireAdmin();
  if (session instanceof Response) return session;

  try {
    const body = await request.json();
    const data = schema.parse(body);

    if (!isValidObjectId(data.userId)) {
      return errorResponse("Invalid user id", 400);
    }

    await connectDB();

    const user = await User.findById(data.userId);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    const telegramInvite = await createSingleUseInviteLink(
      `manual-${user._id.toString()}-${Date.now()}`
    );

    const expireDate = new Date(telegramInvite.expire_date * 1000);

    const invite = await InviteLink.create({
      userId: user._id,
      inviteLink: telegramInvite.invite_link,
      inviteName: telegramInvite.name,
      memberLimit: telegramInvite.member_limit,
      expireDate,
      status: "active",
      isManual: true,
    });

    return secureJsonResponse({
      inviteLink: invite.inviteLink,
      expiresAt: invite.expireDate,
      id: invite._id.toString(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    const message =
      error instanceof Error ? error.message : "Failed to generate invite";
    return errorResponse(message, 500);
  }
}
