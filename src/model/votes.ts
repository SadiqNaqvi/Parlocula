import { StrictModel, VoteModelType } from "@type/models";
import { Schema, model, models } from "mongoose";
import { StrictSchema } from "./general";

const voteModel = new StrictSchema<VoteModelType>({
  type: {
    type: String,
    enum: ["up", "down"],
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

const Vote: StrictModel<VoteModelType> =
  (models.Vote as StrictModel<VoteModelType>) ||
  (model<VoteModelType>("Vote", voteModel) as StrictModel<VoteModelType>);

export default Vote;
