import { parloId } from "@lib/utils";
import { LikesModelType, StrictModel } from "@type/models";
import { model, models } from "mongoose";
import { StrictSchema } from "./general";

const likeModel = new StrictSchema<LikesModelType>({
  _id: { type: String, default: parloId },
  user_id: {
    type: String,
    required: true,
  },
  comment_id: {
    type: String,
    required: true,
  },
});

likeModel.index({ user_id: 1, comment_id: 1 }, { unique: true });

const Like: StrictModel<LikesModelType> =
  (models.Like as any) || (model<LikesModelType>("Like", likeModel) as StrictModel<LikesModelType>);

export default Like;
