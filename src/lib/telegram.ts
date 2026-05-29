const TELEGRAM_API = "https://api.telegram.org/bot";

function getBotToken(): string {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN not configured");
  return token;
}

function getChatId(): string {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) throw new Error("TELEGRAM_CHAT_ID not configured");
  return chatId;
}

async function telegramRequest<T>(
  method: string,
  body?: Record<string, unknown>
): Promise<T> {
  const token = getBotToken();
  const url = `${TELEGRAM_API}${token}/${method}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(
      `Telegram API error: ${data.description || JSON.stringify(data)}`
    );
  }

  return data.result as T;
}

export interface InviteLinkResult {
  invite_link: string;
  name: string;
  expire_date: number;
  member_limit: number;
  creates_join_request: boolean;
}

export async function createSingleUseInviteLink(
  name?: string
): Promise<InviteLinkResult> {
  const chatId = getChatId();
  const expireDate = Math.floor(Date.now() / 1000) + 5 * 60; // 5 minutes

  const result = await telegramRequest<InviteLinkResult>(
    "createChatInviteLink",
    {
      chat_id: chatId,
      name: name || `invite-${Date.now()}`,
      member_limit: 1,
      expire_date: expireDate,
      creates_join_request: false,
    }
  );

  return result;
}

export async function revokeInviteLink(inviteLink: string): Promise<boolean> {
  const chatId = getChatId();
  try {
    await telegramRequest("revokeChatInviteLink", {
      chat_id: chatId,
      invite_link: inviteLink,
    });
    return true;
  } catch {
    return false;
  }
}

export async function banChatMember(
  userId: number,
  revokeMessages = false
): Promise<boolean> {
  const chatId = getChatId();
  try {
    await telegramRequest("banChatMember", {
      chat_id: chatId,
      user_id: userId,
      revoke_messages: revokeMessages,
    });
    return true;
  } catch {
    return false;
  }
}

export async function unbanChatMember(userId: number): Promise<boolean> {
  const chatId = getChatId();
  try {
    await telegramRequest("unbanChatMember", {
      chat_id: chatId,
      user_id: userId,
      only_if_banned: true,
    });
    return true;
  } catch {
    return false;
  }
}

export async function getChatMember(userId: number) {
  const chatId = getChatId();
  try {
    return await telegramRequest<{
      status: string;
      user: { id: number; username?: string; first_name: string };
    }>("getChatMember", {
      chat_id: chatId,
      user_id: userId,
    });
  } catch {
    return null;
  }
}

export async function getChatMemberCount(): Promise<number> {
  const chatId = getChatId();
  return telegramRequest<number>("getChatMemberCount", {
    chat_id: chatId,
  });
}

export async function sendMessage(
  chatId: number | string,
  text: string
): Promise<void> {
  await telegramRequest("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  });
}
