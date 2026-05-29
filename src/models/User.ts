import mongoose, { Schema, Document, Model } from "mongoose";

export type SubscriptionStatus = "none" | "active" | "expired";
export type PaymentStatus = "none" | "pending" | "paid" | "failed";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  telegramUsername?: string;
  telegramUserId?: number;
  role: "user" | "admin";
  subscriptionStatus: SubscriptionStatus;
  paymentStatus: PaymentStatus;
  subscriptionExpiry?: Date;
  subscriptionStart?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    phoneNumber: { type: String, trim: true },
    telegramUsername: { type: String, trim: true, lowercase: true },
    telegramUserId: { type: Number },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    subscriptionStatus: {
      type: String,
      enum: ["none", "active", "expired"],
      default: "none",
    },
    paymentStatus: {
      type: String,
      enum: ["none", "pending", "paid", "failed"],
      default: "none",
    },
    subscriptionExpiry: { type: Date },
    subscriptionStart: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ subscriptionStatus: 1, subscriptionExpiry: 1 });
UserSchema.index({ paymentStatus: 1 });
UserSchema.index({ telegramUserId: 1 });
UserSchema.index({ createdAt: -1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
