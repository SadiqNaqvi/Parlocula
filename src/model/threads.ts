import mongoose, { Schema, models } from "mongoose";
import { linkModel, connectionModel } from "./general";

const lastUpdate = new Schema({
  title: String,
  poster: String,
  description: String,
  nsfw: Boolean,
  links: [linkModel],
  connection: [connectionModel],
});

const threadModel = new Schema(
  {
    title: {
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
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members_count: {
      type: Number,
      default: 1,
    },
    lastUpdatedAt: Date,
    lastUpdate,
    posts_count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Thread = models.Thread || mongoose.model("Thread", threadModel);
export default Thread;
