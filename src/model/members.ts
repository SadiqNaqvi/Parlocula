import { MembershipModelType, StrictModel } from "@type/models";
import { Schema, models, model } from "mongoose";
import { StrictSchema } from "./general";
import { oneDay } from "@lib/constants";
import { parloId } from "@lib/utils";

const memberModel = new StrictSchema<MembershipModelType>({
  _id: { type: String, default: parloId },
  thread_id: {
    type: String,
    ref: "Thread",
    required: true,
  },
  user_id: {
    type: String,
    ref: "User",
    required: true,
  },
  notification: { type: Boolean, default: true },
  banned: { type: Boolean, default: false },
  role: {
    type: String,
    enum: ["creator", "moderator", "member", "moderator_invitee"],
    default: "member",
  },
  actionsTaken: { type: Number, default: 0 },
  expiresAt: { type: Date, default: Date.now() + oneDay * 7 }
}, { timestamps: true, _id: false });

memberModel.index({ thread_id: 1, user_id: 1 }, { unique: true });
memberModel.index({ user_id: 1, banned: 1, role: 1, thread_id: 1 });

const Member: StrictModel<MembershipModelType> =
  (models.Member as any) || model("Member", memberModel);

export default Member;
