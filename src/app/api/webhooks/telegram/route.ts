import { connectDB } from "@/lib/db";
import { banChatMember } from "@/lib/telegram";
import { jsonResponse, errorResponse } from "@/lib/api-utils";
import { User } from "@/models/User";
import { InviteLink } from "@/models/InviteLink";
import { TelegramMember } from "@/models/TelegramMember";

function isValidTelegramWebhookSecret(request: Request): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  // If not set, we intentionally DO NOT allow the webhook in production.
  if (!expected) {
    return process.env.NODE_ENV !== "production";
  }
  const got = request.headers.get("x-telegram-bot-api-secret-token");
  return got === expected;
}

function getConfiguredChatId(): number | null {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) return null;
  const parsed = Number(chatId);
  return Number.isFinite(parsed) ? parsed : null;
}

interface TelegramUpdate {
  update_id: number;
  chat_member?: {
    chat: { id: number };
    from: { id: number; username?: string; first_name?: string; last_name?: string };
    date: number;
    old_chat_member: { status: string; user: { id: number } };
    new_chat_member: { status: string; user: { id: number; username?: string; first_name?: string; last_name?: string } };
  };
  message?: {
    new_chat_members?: Array<{ id: number; username?: string; first_name?: string }>;
    left_chat_member?: { id: number };
  };
}

export async function POST(request: Request) {
  try {
    if (!isValidTelegramWebhookSecret(request)) {
      console.error("[telegram-webhook] invalid secret token header");
      return errorResponse("Unauthorized", 401);
    }

    const update: TelegramUpdate = await request.json();
    const configuredChatId = getConfiguredChatId();

    // Only accept updates for the configured channel/group.
    if (configuredChatId && update.chat_member?.chat?.id) {
      if (update.chat_member.chat.id !== configuredChatId) {
        console.warn(
          "[telegram-webhook] ignored update for unexpected chat_id",
          update.chat_member.chat.id
        );
        return jsonResponse({ ok: true, ignored: true });
      }
    }

    await connectDB();

    if (update.chat_member) {
      const { new_chat_member, old_chat_member } = update.chat_member;
      const telegramUserId = new_chat_member.user.id;
      const newStatus = new_chat_member.status;
      const oldStatus = old_chat_member.status;

      if (
        (oldStatus === "left" || oldStatus === "kicked") &&
        (newStatus === "member" || newStatus === "administrator")
      ) {
        console.log(
          "[telegram-webhook] join event",
          JSON.stringify({
            telegramUserId,
            chatId: update.chat_member.chat.id,
            username: new_chat_member.user.username,
          })
        );

        const user = await User.findOne({ telegramUserId });

        if (!user || user.subscriptionStatus !== "active") {
          await banChatMember(telegramUserId);
          return jsonResponse({ ok: true, action: "banned_unauthorized" });
        }

        if (user.subscriptionExpiry && new Date() > user.subscriptionExpiry) {
          await banChatMember(telegramUserId);
          return jsonResponse({ ok: true, action: "banned_expired" });
        }

        const activeInvite = await InviteLink.findOne({
          userId: user._id,
          status: "active",
          expireDate: { $gt: new Date() },
        }).sort({ createdAt: -1 });

        if (activeInvite) {
          activeInvite.status = "used";
          activeInvite.usedByTelegramId = telegramUserId;
          activeInvite.usedAt = new Date();
          await activeInvite.save();
        }

        let member = await TelegramMember.findOne({ telegramUserId });
        if (!member) {
          member = await TelegramMember.create({
            userId: user._id,
            telegramUserId,
            telegramUsername: new_chat_member.user.username,
            firstName: new_chat_member.user.first_name,
            lastName: new_chat_member.user.last_name,
            status: "active",
            subscriptionExpiry: user.subscriptionExpiry!,
            joinLogs: [
              {
                action: "join",
                timestamp: new Date(),
                details: "Joined via invite link",
              },
            ],
          });
        } else {
          member.status = "active";
          member.joinLogs.push({
            action: "join",
            timestamp: new Date(),
            details: "Rejoined channel",
          });
          await member.save();
        }

        if (!user.telegramUserId) {
          user.telegramUserId = telegramUserId;
          user.telegramUsername = new_chat_member.user.username;
          await user.save();
        }

        return jsonResponse({ ok: true, action: "member_joined" });
      }

      if (
        (newStatus === "left" || newStatus === "kicked") &&
        (oldStatus === "member" || oldStatus === "administrator")
      ) {
        console.log(
          "[telegram-webhook] leave event",
          JSON.stringify({ telegramUserId, newStatus })
        );
        const member = await TelegramMember.findOne({ telegramUserId });
        if (member) {
          member.joinLogs.push({
            action: newStatus === "kicked" ? "kick" : "leave",
            timestamp: new Date(),
          });
          if (newStatus === "left") {
            member.status = "removed";
            member.removedAt = new Date();
          }
          await member.save();
        }
        return jsonResponse({ ok: true, action: "member_left" });
      }
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return jsonResponse({ ok: true });
  }
}
