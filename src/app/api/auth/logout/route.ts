import { clearAuthCookie } from "@/lib/auth";
import { jsonResponse } from "@/lib/api-utils";

export async function POST() {
  await clearAuthCookie();
  return jsonResponse({ success: true });
}
