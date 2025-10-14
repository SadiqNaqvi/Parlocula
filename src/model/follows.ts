import { UserConnectionModelType, StrictModel } from "@type/models";
import { Schema, models, model } from "mongoose";
import { StrictSchema } from "./general";

const followModel = new StrictSchema<UserConnectionModelType>({
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
  blocked: { type: Boolean, default: false, index: true },
  notification: { type: Boolean, default: true, index: true },
}, { timestamps: true });

followModel.index({ followee: 1, follower: 1 }, { unique: true });

const Follow: StrictModel<UserConnectionModelType> =
  (models.Follow as StrictModel<UserConnectionModelType>) ||
  (model<UserConnectionModelType>(
    "Follow",
    followModel
  ) as StrictModel<UserConnectionModelType>);

export default Follow;
