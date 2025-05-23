import { VoteModelType } from "@type/models";
import { Schema, models, model } from "mongoose";

const voteModel = new Schema<VoteModelType>({
  type: {
    type: String,
    enum: ["up, down"],
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comment_id: {
    type: Schema.Types.ObjectId,
    ref: "Comment",
    required: true,
  },
});

voteModel.index({ user_id: 1, comment_id: 1 }, { unique: true });

const Vote = models.Vote || model("Vote", voteModel);

export default Vote;
