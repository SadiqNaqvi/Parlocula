import mongoose, { Schema, models } from "mongoose";
import { linkModel } from "./general";

const postModel = new Schema(
  {
    title: {
      type: String,
      required: [true, "Error creating post: Title of the post is required."],
    },
    body: {
      type: String,
      default: "",
    },
    links: [linkModel],
    tag: String,
    media: String,
    media_type: String,
    nsfw: {
      type: Boolean,
      default: false,
    },
    spoiler: {
      type: Boolean,
      default: false,
    },
    edited: {
      type: Date,
      default: 0,
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
    likes: {
      type: Number,
      default: 0,
    },
    comments: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Prevent duplicate post-user-thread pairs
postModel.index({ thread_id: 1, user_id: 1 }, { unique: true });
// For fetching threads for a user
postModel.index({ user_id: 1, thread_id: 1 });

const Post = models.Post || mongoose.model("Post", postModel);

export default Post;
