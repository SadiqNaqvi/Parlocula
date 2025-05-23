import {
  ConnectionModelType,
  FrameModelType,
  LastUpdateModelType,
  LinkModelType,
  RecentlyJoinedModelType
} from "@type/models";
import { Schema } from "mongoose";

export const linkModel = new Schema<LinkModelType>({
  label: {
    type: String,
    required: [true, "Label for a Link is required."],
  },
  path: {
    type: String,
    required: [true, "Path for a Link is required"],
  },
});

export const connectionModel = new Schema<ConnectionModelType>({
  type: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

export const recentlyJoinedModel = new Schema<RecentlyJoinedModelType>({
  name: String,
  poster: String,
  thread_id: Schema.Types.ObjectId,
});

export const lastUpdate = new Schema<LastUpdateModelType>({
  name: String,
  poster: String,
  description: String,
  nsfw: Boolean,
  links: [linkModel],
  connection: [connectionModel],
});

export const frameModel = new Schema<FrameModelType>({
  path: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["image", "video"],
    required: true,
  },
  isExternal: Boolean,
});
