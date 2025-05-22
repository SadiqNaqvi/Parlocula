import { Schema, models, model } from "mongoose";
import { CommentModelType } from "@type/models";

const commentModel = new Schema<CommentModelType>({
  content: {
    type: String,
    required: true,
  },
  replied_to: {
    type: Schema.Types.ObjectId,
    ref: "Comment",
    default: null,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  post_id: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    required: true,
    index: true,
  },
  upvote_count: { type: Number, default: 0 },
  attachment: String,
  edited_at: {
    type: String,
    default: null,
  },
  saved_count:{
    type: Number,
    default: 0,
    set: (value: number) => Math.max(value, 0),
  },
  nsfw: { type: Boolean, default: false },
  spoiler: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now() },
});

const Comment = models.Comment || model("Comment", commentModel);

export default Comment;
