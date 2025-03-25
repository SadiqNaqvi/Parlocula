import { Schema, models, model } from "mongoose";
import { frameModel, linkModel } from "./general";
import { PostModelType } from "@type/modelTypes";

const postModel = new Schema<PostModelType>(
  {
    title: {
      type: String,
      required: [true, "Title of the post is required."],
    },
    body: {
      type: String,
      default: "",
    },
    links: [linkModel],
    tag: String,
    frames: [frameModel],
    nsfw: {
      type: Boolean,
      default: false,
    },
    spoiler: {
      type: Boolean,
      default: false,
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
    edited_at: {
      type: Date,
      default: null,
    },
    comment_count: {
      type: Number,
      default: 0,
    },
    reaction_count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

postModel.index({ thread_id: 1, user_id: 1 });

const Post = models.Post || model("Post", postModel);

export default Post;
