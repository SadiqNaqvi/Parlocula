import {
  ConnectionModelType,
  FrameModelType,
  LastUpdateModelType,
  LinkModelType,
  RecentlyJoinedModelType,
  ReportModelType,
} from "@type/model";
import { Schema } from "mongoose";

const reportModel = new Schema<ReportModelType>(
  {
    by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    for: {
      type: [String],
      required: [true, "At least one reason to report."],
    },
  },
  { timestamps: true }
);
reportModel.index(
  { by: 1 },
  {
    unique: true,
    partialFilterExpression: { by: { $exists: true, $ne: null } },
  }
);

export { reportModel };

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
  media_type: {
    type: String,
    required: true,
  },
  id: {
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
  size: { type: Number },
});
