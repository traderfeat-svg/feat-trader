import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInviteLink extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  paymentId?: mongoose.Types.ObjectId;
  inviteLink: string;
  inviteName: string;
  memberLimit: number;
  expireDate: Date;
  status: "active" | "used" | "expired" | "revoked";
  usedByTelegramId?: number;
  usedAt?: Date;
  isManual: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const InviteLinkSchema = new Schema<IInviteLink>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
    inviteLink: { type: String, required: true },
    inviteName: { type: String, required: true },
    memberLimit: { type: Number, default: 1 },
    expireDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["active", "used", "expired", "revoked"],
      default: "active",
    },
    usedByTelegramId: { type: Number },
    usedAt: { type: Date },
    isManual: { type: Boolean, default: false },
  },
  { timestamps: true }
);

InviteLinkSchema.index({ status: 1, expireDate: 1 });

export const InviteLink: Model<IInviteLink> =
  mongoose.models.InviteLink ||
  mongoose.model<IInviteLink>("InviteLink", InviteLinkSchema);
