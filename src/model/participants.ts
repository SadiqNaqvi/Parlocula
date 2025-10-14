import { ParticipantModelType, StrictModel } from "@type/models";
import { StrictSchema } from "./general";
import { model, models } from "mongoose";

const participantModel = new StrictSchema<ParticipantModelType>({
  hideAt: { type: Date, default: Date.now },
  mute: {
    type: Boolean,
    default: false,
  },
  room_id: {
    type: StrictSchema.ObjectId,
    ref: "Room",
    required: true,
    index: true,
  },
  seenAt: { type: Date, default: Date.now },
  user_id: {
    type: StrictSchema.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ["participant", "invitee", "creator"],
  },
}, { timestamps: true });

participantModel.index({ room_id: 1, user_id: 1 }, { unique: true });

const Participant: StrictModel<ParticipantModelType> =
  (models.Participant as StrictModel<ParticipantModelType>) ||
  (model<ParticipantModelType>(
    "Participant",
    participantModel
  ) as StrictModel<ParticipantModelType>);

export default Participant;
