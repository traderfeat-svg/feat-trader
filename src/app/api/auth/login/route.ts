import { z } from "zod";
import { connectDB } from "@/lib/db";
import {
  verifyPassword,
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
import { toPublicUser } from "@/lib/user-profile";
import { User } from "@/models/User";

const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1).max(100),
  })
  .strict();

export async function POST(request: Request) {
  const originBlock = requireMutationOrigin(request);
  if (originBlock) return originBlock;

  const ip = getClientIp(request);
  const limit = rateLimit(`login:${ip}`, 10);
  if (!limit.success) {
    return errorResponse("Too many login attempts. Please try again later.", 429);
  }

  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    await connectDB();

    const user = await User.findOne({ email: data.email.toLowerCase() }).select(
      "+password"
    );
    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    const valid = await verifyPassword(data.password, user.password);
    if (!valid) {
      return errorResponse("Invalid email or password", 401);
    }

    if (isAdminEmail(user.email) && user.role !== "admin") {
      user.role = "admin";
      await user.save();
    }

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
    console.error("Login error:", error);
    return errorResponse("Login failed", 500);
  }
}
