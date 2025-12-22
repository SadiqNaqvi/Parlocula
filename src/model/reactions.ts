import { ReactionModelType, StrictModel } from "@type/models";
import { Schema, model, models } from "mongoose";
import { StrictSchema } from "./general";
import { parloId } from "@lib/utils";

const reactionModel = new StrictSchema<ReactionModelType>({
  _id: { type: String, default: parloId },
  reaction: {
    type: String,
    required: true,
  },
  user_id: {
    type: String,
    ref: "User",
    required: true,
  },
  post_id: {
    type: String,
    ref: "Post",
    required: true,
  },
}, { timestamps: true, _id: false });

reactionModel.index({ post_id: 1, user_id: 1 }, { unique: true });

const Reaction: StrictModel<ReactionModelType> =
  (models.Reaction as any) || model("Reaction", reactionModel);

export default Reaction;
