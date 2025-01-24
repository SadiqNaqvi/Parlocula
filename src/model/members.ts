import mongoose, { Schema, models } from "mongoose";

const memberModel = new Schema(
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
    user_role: {
      type: String,
      enum: ["creator", "commentator", "member"],
      default: "member",
    },
  },
  { timestamps: true }
);

// Prevent duplicate members
memberModel.index({ thread_id: 1, user_id: 1 }, { unique: true });
// For fetching threads for a user and users for a thread
memberModel.index({ user_id: 1, thread_id: 1 });

const Member = models.Member || mongoose.model("Member", memberModel);
export default Member;
