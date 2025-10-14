import { PostModelType, StrictModel } from "@type/models";
import { model, models, Schema } from "mongoose";
import { frameModel, linkModel, StrictSchema } from "./general";

const postModel = new StrictSchema<PostModelType>({
  title: {
    type: String,
    required: [true, "Title of the post is required."],
  },
  body: {
    type: String,
    default: "",
  },
  links: [linkModel],
  tag: {
    type: String,
    index: true,
  },
  frames: [frameModel],
  nsfw: {
    type: Boolean,
    default: false,
    index: true,
  },
  spoiler: {
    type: Boolean,
    default: false,
  },
  thread_id: {
    type: Schema.Types.ObjectId,
    ref: "Thread",
    required: true,
    index: true,
  },
  repost_id: {
    type: Schema.Types.ObjectId,
    ref: "Post",
    index: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  edited_at: {
    type: Date,
    default: null,
  },
  comment_count: {
    type: Number,
    default: 0,
    set: (value: number) => Math.max(value, 0),
  },
  reaction_count: {
    type: Number,
    default: 0,
    set: (value: number) => Math.max(value, 0),
  },
  saved_count: {
    type: Number,
    default: 0,
    set: (value: number) => Math.max(value, 0),
  },
  createdAt: { type: Date, default: Date.now },
});

postModel.index(
  {
    title: "text",
  },
  {
    background: true,
    weights: { title: 10 }, // Prioritize title matches
    name: "post_title_text_index",
    default_language: "english", // Handles stemming (e.g., "review" matches "reviews")
    collation: {
      locale: "en", // Case and punctuation-insensitive
      strength: 2,
    },
  }
);

const Post: StrictModel<PostModelType> =
  (models.Post as StrictModel<PostModelType>) ||
  (model<PostModelType>("Post", postModel) as StrictModel<PostModelType>);

export default Post;
