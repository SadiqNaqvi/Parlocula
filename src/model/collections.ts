import { Schema, model, models } from "mongoose";

const collectionModel = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    item_count: {
      type: Number,
      default: 1,
    },
    save_count: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Collection = models.Collection || model("Collection", collectionModel);

export default Collection;
