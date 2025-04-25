import { Schema, models } from "mongoose";
import { linkModel, connectionModel, lastUpdate } from "./general";
import { ThreadModelType } from "@type/model";
import { model } from "mongoose";

const threadModel = new Schema<ThreadModelType>(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    tags: [String],
    poster: String,
    nsfw: {
      type: Boolean,
      default: false,
    },
    links: [linkModel],
    connection: {
      type: [connectionModel],
      required: false,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    edited_at: Date,
    edit: lastUpdate,
    post_count: {
      type: Number,
      default: 0,
    },
    member_count: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

threadModel.index(
  {
    name: "text",
  },
  {
    background: true,
    weights: { name: 10 }, // Prioritize name matches
    name: "thread_name_text_index",
    default_language: "english", // Handles stemming (e.g., "review" matches "reviews")
    collation: {
      locale: "en", // Case and punctuation-insensitive
      strength: 2,
    },
  }
);

const Thread = models.Thread || model<ThreadModelType>("Thread", threadModel);
export default Thread;
