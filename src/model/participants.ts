import { ParticipantModelType, StrictModel } from "@type/models";
import { StrictSchema } from "./general";
import { model, models } from "mongoose";
import { oneDay } from "@lib/constants";
import { parloId } from "@lib/utils";

const participantModel = new StrictSchema<ParticipantModelType>({
  _id: { type: String, default: parloId },
  hideAt: Date,
  mute: {
    type: Boolean,
    default: false,
  },
  room_id: {
    type: String,
    ref: "Room",
    required: true,
  },
  seenAt: Date,
  user_id: {
    type: String,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["participant", "invitee", "creator"],
  },
  expiresAt: {
    type: Date,
    default: new Date(Date.now() + oneDay * 7)
  },
}, { timestamps: true, _id: false });

participantModel.index({ room_id: 1, user_id: 1 }, { unique: true });
participantModel.index({ user_id: 1, type: 1 });
participantModel.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Participant: StrictModel<ParticipantModelType> =
  (models.Participant as any) || model("Participant", participantModel);

export default Participant;
