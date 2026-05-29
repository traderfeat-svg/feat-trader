import { connectDB } from "@/lib/db";
import { withMongoWriteRetries } from "@/lib/mongo-retry";
import { createSingleUseInviteLink, revokeInviteLink } from "@/lib/telegram";
import { getSubscriptionExpiryDate } from "@/lib/subscription";
import { User } from "@/models/User";
import { Payment } from "@/models/Payment";
import { InviteLink } from "@/models/InviteLink";
import { SubscriptionHistory } from "@/models/SubscriptionHistory";
import crypto from "crypto";

export interface FulfillmentResult {
  success: boolean;
  inviteLink?: string;
  inviteExpiresAt?: Date;
  error?: string;
  alreadyProcessed?: boolean;
}

export async function fulfillPayment(
  paymentId: string,
  razorpayPaymentId: string,
  razorpaySignature: string,
  method?: string
): Promise<FulfillmentResult> {
  await connectDB();

  const attemptId = crypto.randomUUID?.() ?? `attempt-${Date.now()}`;
  console.log(
    `[fulfillPayment] start attemptId=${attemptId} razorpayOrderId=${paymentId} razorpayPaymentId=${razorpayPaymentId}`
  );

  // Helper: consistently return the already-created invite (if any).
  async function getExistingInviteForPayment(p: { _id: any; inviteLinkId?: any }) {
    if (p.inviteLinkId) {
      const invite = await InviteLink.findById(p.inviteLinkId);
      return invite;
    }
    // Fallback if inviteLinkId isn't set for older records.
    return InviteLink.findOne({ paymentId: p._id });
  }

  async function revokeExtraInvite(inviteLink: string) {
    // Best-effort revoke to enforce strict single invite behavior.
    await revokeInviteLink(inviteLink);
  }

  // Step 0: Load payment record once for early exit.
  const existingPayment = await Payment.findOne({ razorpayOrderId: paymentId });
  if (!existingPayment) {
    console.error(
      `[fulfillPayment] payment record not found razorpayOrderId=${paymentId}`
    );
    return { success: false, error: "Payment record not found" };
  }

  if (existingPayment.status === "paid") {
    const existingInvite = await getExistingInviteForPayment(existingPayment);
    console.log(
      `[fulfillPayment] already paid razorpayOrderId=${paymentId} inviteLinkId=${existingPayment.inviteLinkId}`
    );
    return {
      success: true,
      alreadyProcessed: true,
      inviteLink: existingInvite?.inviteLink,
      inviteExpiresAt: existingInvite?.expireDate,
    };
  }

  // Step 1: Acquire an atomic processing lock.
  // This prevents duplicate invite link creation and duplicate subscription history writes.
  const lockedPayment = await Payment.findOneAndUpdate(
    {
      razorpayOrderId: paymentId,
      status: { $ne: "paid" },
      $or: [
        { fulfillmentState: { $exists: false } },
        { fulfillmentState: { $in: ["unprocessed", "failed"] } },
      ],
    },
    {
      $set: {
        fulfillmentState: "processing",
        fulfillmentLastError: undefined,
        webhookReceived: true,
      },
      $inc: { fulfillmentAttempts: 1 },
    },
    { new: true }
  );

  // If we can't lock, wait briefly for the other worker/webhook to finish.
  if (!lockedPayment) {
    console.warn(
      `[fulfillPayment] lock not acquired (already processing/paid). razorpayOrderId=${paymentId}`
    );

    for (let i = 0; i < 10; i++) {
      await new Promise((r) => setTimeout(r, 300));
      const p = await Payment.findOne({ razorpayOrderId: paymentId });
      if (p?.status === "paid") {
        const invite = await getExistingInviteForPayment(p);
        return {
          success: true,
          alreadyProcessed: true,
          inviteLink: invite?.inviteLink,
          inviteExpiresAt: invite?.expireDate,
        };
      }
    }

    return {
      success: false,
      error: "Payment fulfillment is currently processing. Please retry shortly.",
    };
  }

  try {
    console.log(
      `[fulfillPayment] lock acquired paymentId=${lockedPayment._id.toString()} processingState=${lockedPayment.fulfillmentState}`
    );

    const user = await User.findById(lockedPayment.userId);
    if (!user) {
      await withMongoWriteRetries(
        () =>
          Payment.findByIdAndUpdate(lockedPayment._id, {
            $set: {
              fulfillmentState: "failed",
              fulfillmentLastError: "User not found",
            },
          }),
        { label: "payment_mark_failed_user_not_found" }
      );
      return { success: false, error: "User not found" };
    }

    const subscriptionStart = new Date();
    const subscriptionExpiry = getSubscriptionExpiryDate(subscriptionStart);
    const isRenewal = Boolean(user.subscriptionStart);

    let inviteLinkDoc: any;
    let expireDate: Date;

    // Step 3: Keep the strict single-invite rule even across retries.
    // If multiple active invites exist for the same payment (from retries),
    // revoke all except the newest one.
    const activeInvites = await InviteLink.find({
      paymentId: lockedPayment._id,
      status: "active",
      expireDate: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (activeInvites.length > 0) {
      inviteLinkDoc = activeInvites[0];
      expireDate = inviteLinkDoc.expireDate;

      // Revoke any extras (best-effort; DB update has retries).
      for (const extra of activeInvites.slice(1)) {
        try {
          await revokeExtraInvite(extra.inviteLink);
        } catch (err) {
          console.error(
            `[fulfillPayment] revoke failed (best-effort) inviteLinkId=${extra._id.toString()}`,
            err instanceof Error ? err.message : err
          );
        }

        await withMongoWriteRetries(
          () =>
            InviteLink.findByIdAndUpdate(extra._id, {
              $set: { status: "revoked" },
            }),
          { label: "inviteLink_revoke_db_update" }
        );
      }
    } else {
      // Step 2: Telegram invite generation (single-use, 1 member, 5 minutes)
      const telegramInvite = await createSingleUseInviteLink(
        `user-${user._id.toString()}-${Date.now()}`
      );

      expireDate = new Date(telegramInvite.expire_date * 1000);

      console.log(
        `[fulfillPayment] telegram invite created razorpayOrderId=${paymentId} inviteName=${telegramInvite.name}`
      );

      inviteLinkDoc = await withMongoWriteRetries(
        () =>
          InviteLink.create({
            userId: user._id,
            paymentId: lockedPayment._id,
            inviteLink: telegramInvite.invite_link,
            inviteName: telegramInvite.name,
            memberLimit: telegramInvite.member_limit,
            expireDate,
            status: "active",
            isManual: false,
          }),
        { label: "inviteLink_create" }
      );
    }

    // Step 4: Create subscription history once per payment (idempotent)
    const existingHistory = await SubscriptionHistory.findOne({
      paymentId: lockedPayment._id,
      action: { $in: ["activated", "renewed"] },
    });

    if (!existingHistory) {
      await withMongoWriteRetries(
        () =>
          SubscriptionHistory.create({
            userId: user._id,
            paymentId: lockedPayment._id,
            action: isRenewal ? "renewed" : "activated",
            startDate: subscriptionStart,
            endDate: subscriptionExpiry,
            notes: `Payment ${razorpayPaymentId}`,
          }),
        { label: "subscriptionHistory_create" }
      );
    }

    // Step 5: Update user subscription
    user.subscriptionStatus = "active";
    user.subscriptionStart = subscriptionStart;
    user.subscriptionExpiry = subscriptionExpiry;
    user.paymentStatus = "paid";

    await withMongoWriteRetries(
      () => user.save(),
      { label: "user_subscription_save" }
    );

    // Step 6: Update payment as paid + attach inviteLink
    await withMongoWriteRetries(
      () =>
        Payment.findByIdAndUpdate(lockedPayment._id, {
          $set: {
            status: "paid",
            razorpayPaymentId,
            razorpaySignature,
            method,
            inviteLinkId: inviteLinkDoc._id,
            processedAt: new Date(),
            webhookReceived: true,
            fulfillmentState: "paid",
            fulfillmentLastError: undefined,
          },
        }),
      { label: "payment_mark_paid_update" }
    );

    console.log(
      `[fulfillPayment] success razorpayOrderId=${paymentId} inviteLinkId=${inviteLinkDoc._id.toString()}`
    );

    return {
      success: true,
      inviteLink: inviteLinkDoc.inviteLink,
      inviteExpiresAt: inviteLinkDoc.expireDate,
    };
  } catch (error) {
    console.error(
      `[fulfillPayment] failed razorpayOrderId=${paymentId} attemptId=${attemptId}`,
      error instanceof Error ? error.message : error
    );

    try {
      await withMongoWriteRetries(
        () =>
          Payment.findByIdAndUpdate(lockedPayment._id, {
            $set: {
              fulfillmentState: "failed",
              fulfillmentLastError:
                error instanceof Error ? error.message : String(error),
            },
          }),
        { label: "payment_mark_failed_final" }
      );
    } catch {
      // ignore: we already failed
    }

    const message = error instanceof Error ? error.message : "Fulfillment failed";
    return { success: false, error: message };
  }
}
