import { Schema, models, model } from "mongoose";
import { CommentModelType, StrictModel } from "@type/models";
import { StrictSchema } from "./general";

const commentModel = new StrictSchema<CommentModelType>({
  content: {
    type: String,
    required: function (this: any) {
      return Boolean(!this.attachment);
    },
  },
  attachment: String,
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
  edited_at: {
    type: String,
    default: null,
  },
  saved_count: {
    type: Number,
    default: 0,
    set: (value: number) => Math.max(value, 0),
  },
  nsfw: { type: Boolean, default: false },
  spoiler: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Comment: StrictModel<CommentModelType> =
  (models.Comment as StrictModel<CommentModelType>) ||
  (model<CommentModelType>(
    "Comment",
    commentModel
  ) as StrictModel<CommentModelType>);

export default Comment;
