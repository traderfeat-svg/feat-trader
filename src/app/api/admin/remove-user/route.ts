import { z } from "zod";
import { connectDB } from "@/lib/db";
import { banChatMember } from "@/lib/telegram";
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
import { TelegramMember } from "@/models/TelegramMember";
import { SubscriptionHistory } from "@/models/SubscriptionHistory";

const schema = z
  .object({
    userId: z.string(),
    reason: z.string().max(500).optional(),
  })
  .strict();

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

    if (user.telegramUserId) {
      await banChatMember(user.telegramUserId);
      const member = await TelegramMember.findOne({
        telegramUserId: user.telegramUserId,
      });
      if (member) {
        member.status = "removed";
        member.removedAt = new Date();
        member.removalReason = data.reason || "Manual removal by admin";
        member.joinLogs.push({
          action: "kick",
          timestamp: new Date(),
          details: "Admin manual removal",
        });
        await member.save();
      }
    }

    user.subscriptionStatus = "expired";
    await user.save();

    await SubscriptionHistory.create({
      userId: user._id,
      action: "manual_revoke",
      startDate: user.subscriptionStart || new Date(),
      endDate: new Date(),
      notes: data.reason || "Manual removal by admin",
      performedBy: session.userId,
    });

    return secureJsonResponse({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) return handleZodError(error);
    return errorResponse("Removal failed", 500);
  }
}
