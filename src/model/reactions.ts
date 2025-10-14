import { ReactionModelType, StrictModel } from "@type/models";
import { Schema, model, models } from "mongoose";
import { StrictSchema } from "./general";

const reactionModel = new StrictSchema<ReactionModelType>(
  {
    reaction: {
      type: String,
      required: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post_id: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true }
);

reactionModel.index({ user_id: 1, post_id: 1 }, { unique: true });

const Reaction: StrictModel<ReactionModelType> =
  (models.Reaction as StrictModel<ReactionModelType>) ||
  (model<ReactionModelType>(
    "Reaction",
    reactionModel
  ) as StrictModel<ReactionModelType>);

export default Reaction;
