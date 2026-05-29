import { connectDB } from "@/lib/db";
import { secureJsonResponse } from "@/lib/api-utils";
import { requireAdmin } from "@/lib/api-guard";
import { Payment } from "@/models/Payment";

export async function GET() {
  const session = await requireAdmin();
  if (session instanceof Response) return session;

  await connectDB();

  const payments = await Payment.find()
    .populate("userId", "email name")
    .sort({ createdAt: -1 })
    .limit(200);

  return secureJsonResponse({ payments });
}
