import { connectDB } from "@/lib/db";
import { banChatMember } from "@/lib/telegram";
import { User } from "@/models/User";
import { TelegramMember } from "@/models/TelegramMember";
import { SubscriptionHistory } from "@/models/SubscriptionHistory";

export async function processExpiredSubscriptions(): Promise<{
  processed: number;
  errors: string[];
}> {
  await connectDB();

  const now = new Date();
  const errors: string[] = [];
  let processed = 0;

  const expiredUsers = await User.find({
    subscriptionStatus: "active",
    subscriptionExpiry: { $lte: now },
  });

  for (const user of expiredUsers) {
    try {
      user.subscriptionStatus = "expired";
      await user.save();

      if (user.telegramUserId) {
        const banned = await banChatMember(user.telegramUserId);
        const member = await TelegramMember.findOne({
          telegramUserId: user.telegramUserId,
          status: "active",
        });

        if (member) {
          member.status = "removed";
          member.removedAt = now;
          member.removalReason = "Subscription expired (6 months)";
          member.joinLogs.push({
            action: "kick",
            timestamp: now,
            details: banned
              ? "Auto-removed via ban"
              : "Subscription expired - ban may have failed",
          });
          await member.save();
        }
      }

      await SubscriptionHistory.create({
        userId: user._id,
        action: "expired",
        startDate: user.subscriptionStart || now,
        endDate: user.subscriptionExpiry || now,
        notes: "Auto-expired by cron job",
      });

      processed++;
    } catch (err) {
      errors.push(
        `User ${user._id}: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    }
  }

  return { processed, errors };
}
