import { ReactionModelType } from "@type/models";
import { Schema, models, model } from "mongoose";

const reactionModel = new Schema<ReactionModelType>(
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

const Reaction = models.Reaction || model("Reaction", reactionModel);

export default Reaction;
