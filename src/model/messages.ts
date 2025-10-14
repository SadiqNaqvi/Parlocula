import { MessageModelType, StrictModel } from "@type/models";
import { Schema, model, models } from "mongoose";
import { StrictSchema } from "./general";

export const messageModel = new StrictSchema<MessageModelType>({
  _id: Schema.ObjectId,
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  room_id: {
    type: Schema.ObjectId,
    ref: "Room",
    required: true,
    index: true,
  },
  user_id: {
    type: Schema.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  username: { type: String, required: true },
  replied_to: { type: Schema.Types.ObjectId, ref: 'Message', required: false, default: undefined },
  replied_content: { type: Schema.Types.ObjectId, ref: 'Message', required: false, default: undefined },
});

messageModel.index({ createdAt: 1 }, { expireAfterSeconds: 3600 * 24 });

const Message: StrictModel<MessageModelType> =
  (models.Message as StrictModel<MessageModelType>) ||
  (model<MessageModelType>(
    "Message",
    messageModel
  ) as StrictModel<MessageModelType>);

export default Message;
