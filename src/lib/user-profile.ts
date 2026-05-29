import { z } from "zod";

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100);

export const emailSchema = z.string().trim().email("Invalid email address");

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .transform((val) => val.replace(/\D/g, ""))
  .pipe(
    z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .max(15, "Phone number is too long")
      .regex(/^\d+$/, "Phone number must contain digits only")
  );

export const telegramUsernameSchema = z
  .string()
  .trim()
  .min(1, "Telegram username is required")
  .max(64)
  .transform((val) => normalizeTelegramUsername(val))
  .pipe(
    z
      .string()
      .min(1, "Telegram username is required")
      .regex(
        /^[a-zA-Z0-9_]{5,32}$/,
        "Enter a valid Telegram username (5–32 characters, letters, numbers, underscore)"
      )
  );

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100);

export const signupSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema,
    phoneNumber: phoneSchema,
    telegramUsername: telegramUsernameSchema,
  })
  .strict();

export const profileUpdateSchema = z
  .object({
    name: nameSchema.optional(),
    phoneNumber: phoneSchema.optional(),
    telegramUsername: telegramUsernameSchema.optional(),
    telegramUserId: z.coerce.number().int().positive().optional(),
  })
  .strict();

export function normalizeTelegramUsername(username: string): string {
  return username.trim().replace(/^@+/, "").toLowerCase();
}

export type ProfileCheckFields = {
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  telegramUsername?: string | null;
};

export function getMissingProfileFields(user: ProfileCheckFields): string[] {
  const missing: string[] = [];
  if (!user.name || user.name.trim().length < 2) missing.push("name");
  if (!user.email?.trim()) missing.push("email");
  if (!user.phoneNumber || user.phoneNumber.replace(/\D/g, "").length < 10) {
    missing.push("phoneNumber");
  }
  if (!user.telegramUsername?.trim()) missing.push("telegramUsername");
  return missing;
}

export function isProfileComplete(user: ProfileCheckFields): boolean {
  return getMissingProfileFields(user).length === 0;
}

export const PROFILE_FIELD_LABELS: Record<string, string> = {
  name: "Full Name",
  email: "Email",
  phoneNumber: "Phone Number",
  telegramUsername: "Telegram Username",
};

export function toPublicUser(user: {
  _id: { toString(): string };
  email: string;
  name: string;
  phoneNumber?: string;
  telegramUsername?: string;
  telegramUserId?: number;
  role: string;
  subscriptionStatus: string;
  subscriptionStart?: Date;
  subscriptionExpiry?: Date;
  paymentStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    phoneNumber: user.phoneNumber ?? "",
    telegramUsername: user.telegramUsername ?? "",
    telegramUserId: user.telegramUserId,
    role: user.role,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionStart: user.subscriptionStart,
    subscriptionExpiry: user.subscriptionExpiry,
    paymentStatus: user.paymentStatus ?? "none",
    profileComplete: isProfileComplete(user),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
