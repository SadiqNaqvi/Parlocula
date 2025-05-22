import { Schema, models, model } from "mongoose";

const notificationModel = new Schema({
  title: { type: String, required: true },
  message: String,
  poster: String,
  path: String,
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: new Date(Date.now() + 1000 * 86400 * 2),
});

notificationModel.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification =
  models.Notification || model("Notification", notificationModel);

export default Notification;
