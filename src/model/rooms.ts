import { oneWeekInMiliSeconds } from "@lib/constants";
import { parloId } from "@lib/utils";
import { RoomModelType, StrictModel } from "@type/models";
import { model, models, Schema } from "mongoose";
import { frameModel, numberSchema, StrictSchema } from "./general";

const roomModel = new StrictSchema<RoomModelType>({
  _id: { type: String, default: parloId },
  participants: [String],
  participant_count: { ...numberSchema, default: 1 },
  type: {
    type: String,
    enum: ["private", "group"],
    required: true,
  },
  name: String,
  poster: frameModel,
  lastMessage: { type: String, required: true },
  lastMessageAt: { type: Date, required: true },
  lastMessageBy: { type: String, required: true },
  invitationMessage: {
    type: new Schema({
      content: String,
      user_id: String,
      username: String,
      createdAt: Number,
    }),
    required: true,
  },
  expiresAt: {
    type: Date,
    default: new Date(Date.now() + oneWeekInMiliSeconds)
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

roomModel.index({ participants: 1 }, {
  unique: true,
  partialFilterExpression: { $exists: true }
});

roomModel.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Room: StrictModel<RoomModelType> =
  (models.Room as any) || model("Room", roomModel);

export default Room;
