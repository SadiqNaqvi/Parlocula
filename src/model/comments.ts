import { oneDay } from "@lib/constants";
import { parloId } from "@lib/utils";
import { CommentModelType, StrictModel } from "@type/models";
import { model, models } from "mongoose";
import { numberSchema, StrictSchema } from "./general";

const commentModel = new StrictSchema<CommentModelType>({
  _id: { type: String, default: parloId },
  content: {
    type: String,
    required: function (this: any) {
      return Boolean(!this.attachment);
    },
    default: "",
  },
  attachment: String,
  replied_to: {
    type: String,
    ref: "Comment",
  },
  user_id: {
    type: String,
    ref: "User",
    required: true,
  },
  post_id: {
    type: String,
    ref: "Post",
    required: true,
  },
  edited_at: String,
  saved_count: numberSchema,
  likes_count: numberSchema,
  replies_count: numberSchema,
  nsfw: { type: Boolean, default: false },
  spoiler: { type: Boolean, default: false },
}, { timestamps: true, _id: false });

commentModel.index({ user_id: 1, nsfw: 1 });
commentModel.index({ post_id: 1, nsfw: 1 });

const Comment: StrictModel<CommentModelType> =
  (models.Comment as any) ||
  (model("Comment", commentModel) as StrictModel<CommentModelType>);

export default Comment;
