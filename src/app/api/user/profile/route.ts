import { z } from "zod";
import { connectDB } from "@/lib/db";
import {
  secureJsonResponse,
  handleZodError,
  errorResponse,
} from "@/lib/api-utils";
import {
  requireSession,
  requireMutationOrigin,
} from "@/lib/api-guard";
import { profileUpdateSchema, toPublicUser } from "@/lib/user-profile";
import { User } from "@/models/User";

export async function PATCH(request: Request) {
  const originBlock = requireMutationOrigin(request);
  if (originBlock) return originBlock;

  const session = await requireSession();
  if (session instanceof Response) return session;

  try {
    const body = await request.json();
    const data = profileUpdateSchema.parse(body);

    await connectDB();

    const user = await User.findById(session.userId);
    if (!user) {
      return errorResponse("User not found", 404);
    }

    if (data.name !== undefined) user.name = data.name;
    if (data.phoneNumber !== undefined) user.phoneNumber = data.phoneNumber;
    if (data.telegramUsername !== undefined) {
      user.telegramUsername = data.telegramUsername;
    }
    if (data.telegramUserId !== undefined) {
      user.telegramUserId = data.telegramUserId;
    }

    await user.save();

    return secureJsonResponse({
      user: toPublicUser(user),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return handleZodError(error);
    }
    return errorResponse("Update failed", 500);
  }
}
