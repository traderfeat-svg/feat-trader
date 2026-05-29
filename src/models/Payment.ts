import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: "created" | "pending" | "paid" | "failed" | "refunded";
  method?: string;
  inviteLinkId?: mongoose.Types.ObjectId;
  processedAt?: Date;
  webhookReceived: boolean;
  idempotencyKey: string;
  metadata?: Record<string, string>;
  fulfillmentState?: "unprocessed" | "processing" | "paid" | "failed";
  fulfillmentAttempts?: number;
  fulfillmentLastError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, sparse: true, unique: true },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: {
      type: String,
      enum: ["created", "pending", "paid", "failed", "refunded"],
      default: "created",
    },
    method: { type: String },
    inviteLinkId: { type: Schema.Types.ObjectId, ref: "InviteLink" },
    processedAt: { type: Date },
    webhookReceived: { type: Boolean, default: false },
    idempotencyKey: { type: String, required: true, unique: true },
    metadata: { type: Map, of: String },
    fulfillmentState: {
      type: String,
      enum: ["unprocessed", "processing", "paid", "failed"],
      default: "unprocessed",
      index: true,
    },
    fulfillmentAttempts: { type: Number, default: 0 },
    fulfillmentLastError: { type: String },
  },
  { timestamps: true }
);

PaymentSchema.index({ status: 1, createdAt: -1 });
PaymentSchema.index({ razorpayOrderId: 1, fulfillmentState: 1 });

export const Payment: Model<IPayment> =
  mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);
