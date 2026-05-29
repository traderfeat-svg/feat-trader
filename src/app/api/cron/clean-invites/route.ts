import { connectDB } from "@/lib/db";
import { verifyCronSecret } from "@/lib/api-utils";
import { revokeInviteLink } from "@/lib/telegram";
import { InviteLink } from "@/models/InviteLink";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const now = new Date();

    const expiredInvites = await InviteLink.find({
      status: "active",
      expireDate: { $lte: now },
    });

    let cleaned = 0;
    for (const invite of expiredInvites) {
      await revokeInviteLink(invite.inviteLink);
      invite.status = "expired";
      await invite.save();
      cleaned++;
    }

    return NextResponse.json({
      success: true,
      cleaned,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("Clean invites cron error:", error);
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 });
  }
}
