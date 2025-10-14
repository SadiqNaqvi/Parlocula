import { MemberModelType, StrictModel } from "@type/models";
import { Schema, models, model } from "mongoose";
import { StrictSchema } from "./general";

const memberModel = new StrictSchema<MemberModelType>(
  {
    thread_id: {
      type: Schema.Types.ObjectId,
      ref: "Thread",
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);

memberModel.index({ thread_id: 1, user_id: 1, role: 1 }, { unique: true });
memberModel.index({
  thread_id: 1,
  user_id: 1,
  role: 1,
  notification: 1,
  banned: 1,
});

const Member: StrictModel<MemberModelType> =
  (models.Member as StrictModel<MemberModelType>) ||
  (model<MemberModelType>(
    "Member",
    memberModel
  ) as StrictModel<MemberModelType>);

export default Member;
