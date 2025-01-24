import mongoose, { Schema, models } from "mongoose";
import { reportModel } from "./general";

const commentModel = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
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
    post_id: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    reports: [reportModel],
  },
  { timestamps: true }
);

// Prevent duplicate comments
commentModel.index({ thread_id: 1, user_id: 1, post_id: 1 }, { unique: true });
// For fetching using indexes
commentModel.index({ user_id: 1, thread_id: 1, post_id: 1 });

const Comment = models.Comment || mongoose.model("Comment", commentModel);

export default Comment;
