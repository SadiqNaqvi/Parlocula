import { Schema, model, models } from "mongoose";

const listModel = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    poster: String,
    description: String,
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    key: String,
    last_added: Date,
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

const List = models.List || model("List", listModel);

export default List;

/*----- Pre defined ------
1. Favourites
2. Watched
3. Private
4. Saved 
5. Contribute
*/