import { connectDB } from "@/lib/db";
import {
  hashPassword,
  createToken,
  setAuthCookie,
  isAdminEmail,
} from "@/lib/auth";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  secureJsonResponse,
  errorResponse,
  handleZodError,
} from "@/lib/api-utils";
import { requireMutationOrigin } from "@/lib/api-guard";
import { signupSchema, toPublicUser } from "@/lib/user-profile";
import { User } from "@/models/User";
import { z } from "zod";

export async function POST(request: Request) {
  const originBlock = requireMutationOrigin(request);
  if (originBlock) return originBlock;

  const ip = getClientIp(request);
  const limit = rateLimit(`signup:${ip}`, 5);
  if (!limit.success) {
    return errorResponse("Too many requests. Please try again later.", 429);
  }

  try {
    const body = await request.json();
    const data = signupSchema.parse(body);

    await connectDB();

    const existing = await User.findOne({ email: data.email.toLowerCase() });
    if (existing) {
      return errorResponse("Email already registered", 409);
    }

    const hashedPassword = await hashPassword(data.password);
    const role = isAdminEmail(data.email) ? "admin" : "user";

    const user = await User.create({
      email: data.email.toLowerCase(),
      password: hashedPassword,
      name: data.name,
      phoneNumber: data.phoneNumber,
      telegramUsername: data.telegramUsername,
      role,
      paymentStatus: "none",
    });

    const token = await createToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    await setAuthCookie(token);

    return secureJsonResponse({
      user: toPublicUser(user),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }
    console.error("Signup error:", error);
    return errorResponse("Registration failed", 500);
  }
}
