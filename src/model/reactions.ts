import mongoose, { Schema, models } from "mongoose";

const reactionModel = new Schema(
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
reactionModel.index({ user_id: 1, post_id: 1 });

const Reaction = models.Reaction || mongoose.model("Reaction", reactionModel);

export default Reaction;