import { ListItemModelType, StrictModel } from "@type/models";
import { Schema, models, model } from "mongoose";
import { StrictSchema } from "./general";

const itemModel = new StrictSchema<ListItemModelType>({
  media_id: {
    type: Schema.Types.ObjectId,
    ref: "Media",
    required: true,
  },
  list_id: {
    type: Schema.Types.ObjectId,
    ref: "List",
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  tmdb_id: { type: String, required: true },
  year: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

itemModel.index({ media_id: 1, list_id: 1, tmdb_id: 1 });
itemModel.index({ media_id: 1, list_id: 1 }, { unique: true });

const Item: StrictModel<ListItemModelType> =
  (models.Item as StrictModel<ListItemModelType>) ||
  (model<ListItemModelType>(
    "Item",
    itemModel
  ) as StrictModel<ListItemModelType>);

export default Item;
