import { NextResponse } from "next/server";
import { ZodError } from "zod";

const PRIVATE_RESPONSE_HEADERS: Record<string, string> = {
  "Cache-Control": "no-store, no-cache, must-revalidate, private",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
};

export function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/** For auth/payment/user data — never cache in browser/CDN. */
export function secureJsonResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: PRIVATE_RESPONSE_HEADERS,
  });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function unauthorizedResponse(message = "Unauthorized") {
  return errorResponse(message, 401);
}

export function forbiddenResponse(message = "Forbidden") {
  return errorResponse(message, 403);
}

export function serverErrorResponse(message = "Internal server error") {
  return errorResponse(message, 500);
}

export function handleZodError(error: ZodError) {
  const messages = error.errors.map((e) => e.message).join(", ");
  return errorResponse(messages, 400);
}

export function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[cron] CRON_SECRET missing in production");
    }
    return false;
  }
  return authHeader === `Bearer ${cronSecret}`;
}
