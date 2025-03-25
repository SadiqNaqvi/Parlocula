import { Schema, model, models } from "mongoose";

const ItemModel = new Schema({
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
  createdAt: { type: Date, default: Date.now() },
});

ItemModel.index({ media_id: 1, list_id: 1, tmdb_id: 1 });
ItemModel.index({ media_id: 1, list_id: 1 }, { unique: true });

const Item = models.Item || model("Item", ItemModel);

export default Item;
