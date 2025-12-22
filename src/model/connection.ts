import { ConnectionModelType, StrictModel } from "@type/models";
import { model, models } from "mongoose";
import { StrictSchema } from "./general";
import { parloId } from "@lib/utils";

const connectionModel = new StrictSchema<ConnectionModelType>({
  _id: { type: String, default: parloId },
  followee: {
    type: String,
    ref: "User",
    required: true,
  },
  follower: {
    type: String,
    ref: "User",
    required: true,
  },
  blocked: { type: Boolean, default: false },
  notification: { type: Boolean, default: true },
}, { timestamps: true });

connectionModel.index({ followee: 1, blocked: 1, follower: 1 }, { unique: true });
connectionModel.index({ follower: 1, blocked: 1 });

const Connection: StrictModel<ConnectionModelType> =
  (models.Connection as any) || (model("Connection", connectionModel));

export default Connection;
