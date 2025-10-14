import { Schema, model, models } from "mongoose";
import { StrictSchema } from "./general";
import { NotificationModelType, StrictModel } from "@type/models";

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
  message: {
    type: [messageItemSchema],
    required: true,
  },
  title: { type: String, required: true },
  path: String,
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
});

notificationModel.index({ user_id: 1, type: 1 });
notificationModel.index({ user_id: 1, status: 1 });
notificationModel.index({ user_id: 1, metadata: 1 });

notificationModel.index({ createdAt: 1 }, { expireAfterSeconds: 86400 * 2 });

const Notification: StrictModel<NotificationModelType> =
  (models.Notification as StrictModel<NotificationModelType>) ||
  (model<NotificationModelType>(
    "Notification",
    notificationModel
  ) as StrictModel<NotificationModelType>);

export default Notification;
