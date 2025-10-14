import { RoomModelType, StrictModel } from "@type/models";
import { Schema, model, models } from "mongoose";
import { StrictSchema } from "./general";

const roomModel = new StrictSchema<RoomModelType>({
  _id: Schema.ObjectId,
  participants: { type: [Schema.ObjectId], index: true },
  type: {
    type: String,
    enum: ["private", "group"],
    required: true,
    index: true,
  },
  name: String,
  poster: String,
  lastMessage: { type: String, required: true },
  lastMessageAt: { type: Date, required: true },
  lastMessageBy: { type: String, required: true },
  invitationMessage: {
    type: new Schema({
      content: String,
      user_id: Schema.ObjectId,
      username: String,
      createdAt: Number,
    }),
    required: true,
  },
});

roomModel.index(
  {
    name: "text",
  },
  {
    background: true,
    weights: { name: 10 }, // Prioritize name matches
    name: "room_name_text_index",
    default_language: "english", // Handles stemming (e.g., "review" matches "reviews")
    collation: {
      locale: "en", // Case and punctuation-insensitive
      strength: 2,
    },
  }
);

const Room: StrictModel<RoomModelType> =
  (models.Room as StrictModel<RoomModelType>) ||
  (model<RoomModelType>("Room", roomModel) as StrictModel<RoomModelType>);

export default Room;
