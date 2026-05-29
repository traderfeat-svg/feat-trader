import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITelegramMember extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  telegramUserId: number;
  telegramUsername?: string;
  firstName?: string;
  lastName?: string;
  status: "active" | "removed" | "banned";
  joinedAt: Date;
  removedAt?: Date;
  removalReason?: string;
  subscriptionExpiry: Date;
  joinLogs: Array<{
    action: "join" | "leave" | "kick" | "ban";
    timestamp: Date;
    details?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const JoinLogSchema = new Schema(
  {
    action: {
      type: String,
      enum: ["join", "leave", "kick", "ban"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
    details: { type: String },
  },
  { _id: false }
);

const TelegramMemberSchema = new Schema<ITelegramMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    telegramUserId: { type: Number, required: true, unique: true },
    telegramUsername: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    status: {
      type: String,
      enum: ["active", "removed", "banned"],
      default: "active",
    },
    joinedAt: { type: Date, default: Date.now },
    removedAt: { type: Date },
    removalReason: { type: String },
    subscriptionExpiry: { type: Date, required: true, index: true },
    joinLogs: [JoinLogSchema],
  },
  { timestamps: true }
);

TelegramMemberSchema.index({ status: 1, subscriptionExpiry: 1 });

export const TelegramMember: Model<ITelegramMember> =
  mongoose.models.TelegramMember ||
  mongoose.model<ITelegramMember>("TelegramMember", TelegramMemberSchema);
