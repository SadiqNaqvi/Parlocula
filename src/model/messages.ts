import { oneDayInSeconds } from "@lib/constants";
import { parloId } from "@lib/utils";
import { MessageModelType, StrictModel } from "@type/models";
import { model, models } from "mongoose";
import { StrictSchema } from "./general";

export const messageModel = new StrictSchema<MessageModelType>({
  _id: { type: String, default: parloId },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  room_id: {
    type: String,
    ref: "Room",
    required: true,
  },
  user_id: {
    type: String,
    ref: "User",
    required: true,
  },
  username: { type: String, required: true },
  replied_to: { type: String, ref: 'Message', required: false, default: undefined },
  replied_content: { type: String, ref: 'Message', required: false, default: undefined },
});
messageModel.index({ createdAt: 1 }, { expireAfterSeconds: oneDayInSeconds * 3 });
messageModel.index({ room_id: 1, createdAt: 1 });

const Message: StrictModel<MessageModelType> =
  (models.Message as any) || model("Message", messageModel);

export default Message;
