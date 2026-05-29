import type { IUser } from "@/models/User";

export type AdminUserSort =
  | "newest"
  | "oldest"
  | "active"
  | "expired";

export type AdminUserFilter = "all" | "active" | "expired";

export function buildAdminUserSort(sort: AdminUserSort): Record<string, 1 | -1> {
  switch (sort) {
    case "oldest":
      return { createdAt: 1 };
    case "active":
      return { subscriptionStatus: -1, subscriptionExpiry: -1, createdAt: -1 };
    case "expired":
      return { subscriptionStatus: 1, subscriptionExpiry: 1, createdAt: -1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
}

export function buildAdminUserFilter(
  filter: AdminUserFilter
): Record<string, unknown> {
  const now = new Date();
  if (filter === "active") {
    return {
      subscriptionStatus: "active",
      subscriptionExpiry: { $gt: now },
    };
  }
  if (filter === "expired") {
    return {
      $or: [
        { subscriptionStatus: "expired" },
        { subscriptionExpiry: { $lte: now } },
        {
          subscriptionStatus: "active",
          subscriptionExpiry: { $exists: true, $lte: now },
        },
      ],
    };
  }
  return {};
}

export function toAdminUserListItem(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber || "—",
    telegramUsername: user.telegramUsername
      ? `@${user.telegramUsername}`
      : "—",
    createdAt: user.createdAt,
    subscriptionStatus: user.subscriptionStatus,
    paymentStatus: user.paymentStatus ?? "none",
    subscriptionExpiry: user.subscriptionExpiry ?? null,
  };
}
