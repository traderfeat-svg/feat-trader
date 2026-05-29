import { connectDB } from "@/lib/db";
import mongoose, { Schema, Model } from "mongoose";

export interface IWebhookEvent extends mongoose.Document {
  provider: "razorpay" | "telegram";
  eventId: string;
  processedAt: Date;
}

const WebhookEventSchema = new Schema<IWebhookEvent>(
  {
    provider: { type: String, enum: ["razorpay", "telegram"], required: true },
    eventId: { type: String, required: true },
    processedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

WebhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });

const WebhookEvent: Model<IWebhookEvent> =
  mongoose.models.WebhookEvent ||
  mongoose.model<IWebhookEvent>("WebhookEvent", WebhookEventSchema);

/**
 * Returns true if this event was already processed (duplicate webhook).
 */
export async function markWebhookEventProcessed(
  provider: "razorpay" | "telegram",
  eventId: string
): Promise<{ duplicate: boolean }> {
  await connectDB();
  try {
    await WebhookEvent.create({ provider, eventId });
    return { duplicate: false };
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    if (code === 11000) return { duplicate: true };
    throw err;
  }
}
