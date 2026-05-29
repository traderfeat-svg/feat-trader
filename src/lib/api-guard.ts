import { getSession, type JWTPayload } from "@/lib/auth";
import {
  forbiddenResponse,
  unauthorizedResponse,
} from "@/lib/api-utils";
import mongoose from "mongoose";

/** Reject cross-site POSTs when using cookie auth (basic CSRF mitigation). */
export function isAllowedMutationOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const allowedHosts = new Set<string>();

  if (appUrl) {
    try {
      allowedHosts.add(new URL(appUrl).host);
    } catch {
      /* ignore */
    }
  }

  if (process.env.VERCEL_URL) {
    allowedHosts.add(process.env.VERCEL_URL);
  }

  // Local dev
  allowedHosts.add("localhost:3000");
  allowedHosts.add("127.0.0.1:3000");

  const checkUrl = (url: string | null): boolean => {
    if (!url) return false;
    try {
      return allowedHosts.has(new URL(url).host);
    } catch {
      return false;
    }
  };

  // Same-origin navigations may omit Origin; allow Referer fallback
  if (origin) return checkUrl(origin);
  if (referer) return checkUrl(referer);

  // Non-browser clients (cron, webhooks) should not use this guard
  return false;
}

export async function requireSession(): Promise<
  JWTPayload | Response
> {
  const session = await getSession();
  if (!session) return unauthorizedResponse();
  return session;
}

export async function requireAdmin(): Promise<JWTPayload | Response> {
  const session = await requireSession();
  if (session instanceof Response) return session;
  if (session.role !== "admin") return forbiddenResponse();
  return session;
}

export function requireMutationOrigin(request: Request): Response | null {
  if (process.env.NODE_ENV !== "production") {
    // Allow local testing without strict origin in dev
    return null;
  }
  if (!isAllowedMutationOrigin(request)) {
    return forbiddenResponse("Invalid request origin");
  }
  return null;
}

export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;
}
