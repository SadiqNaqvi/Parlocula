import { MemberModelType } from "@type/model";
import { Schema, models, model } from "mongoose";

const memberModel = new Schema<MemberModelType>(
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
  },
  { timestamps: true }
);

memberModel.index({ thread_id: 1, user_id: 1 }, { unique: true });

const Member = models.Member || model("Member", memberModel);
export default Member;
