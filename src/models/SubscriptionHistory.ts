import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscriptionHistory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId;
  action:
    | "activated"
    | "renewed"
    | "expired"
    | "revoked"
    | "manual_grant"
    | "manual_revoke";
  startDate: Date;
  endDate: Date;
  notes?: string;
  performedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const SubscriptionHistorySchema = new Schema<ISubscriptionHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    action: {
      type: String,
      enum: [
        "activated",
        "renewed",
        "expired",
        "revoked",
        "manual_grant",
        "manual_revoke",
      ],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    notes: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SubscriptionHistorySchema.index({ userId: 1, createdAt: -1 });

export const SubscriptionHistory: Model<ISubscriptionHistory> =
  mongoose.models.SubscriptionHistory ||
  mongoose.model<ISubscriptionHistory>(
    "SubscriptionHistory",
    SubscriptionHistorySchema
  );
