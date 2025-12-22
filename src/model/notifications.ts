import { Schema, model, models } from "mongoose";
import { StrictSchema } from "./general";
import { NotificationModelType, StrictModel } from "@type/models";
import { oneDay } from "@lib/constants";
import { parloId } from "@lib/utils";

const messageItemSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["text", "link"],
    },
    text: {
      type: String,
      required: function (this: any) {
        return this.type === "text";
      },
    },
    label: {
      type: String,
      required: function (this: any) {
        return this.type === "link";
      },
    },
    path: {
      type: String,
      required: function (this: any) {
        return this.type === "link";
      },
    },
  },
  { _id: false }
);

const notificationModel = new StrictSchema<NotificationModelType>({
  _id: { type: String, default: parloId },
  message: {
    type: [messageItemSchema],
    required: true,
  },
  title: { type: String, required: true },
  poster: String,
  path: String,
  user_id: { type: String, ref: "User", required: true },
  type: {
    type: String,
    enum: ["request", "informative"],
    default: "informative",
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "denied"],
  },
  request_type: String,
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  expiresAt: {
    type: Date,
    default: new Date(oneDay * 3)
  }
});

notificationModel.index({ user_id: 1, type: 1 });
notificationModel.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification: StrictModel<NotificationModelType> =
  (models.Notification as any) || model("Notification", notificationModel);

export default Notification;
