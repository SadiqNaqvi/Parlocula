import mongoose, { Schema, models } from "mongoose";

const voteModel = new Schema({
  type: {
    type: String,
    enum: ["upvote, downvote"],
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
voteModel.index({ user_id: 1, comment_id: 1 });

const Vote = models.Vote || mongoose.model("Vote", voteModel);

export default Vote;
