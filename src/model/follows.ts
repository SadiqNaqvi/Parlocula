import { FollowModelType } from "@type/models";
import { Schema, models, model } from "mongoose";

const followModel = new Schema<FollowModelType>({
  followee: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  follower: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

followModel.index({ followee: 1, follower: 1 }, { unique: true });

const Follow = models.Follow || model("Follow", followModel);

export default Follow;
