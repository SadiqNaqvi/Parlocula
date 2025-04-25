import { Schema, model, models } from "mongoose";

const listModel = new Schema({
  name: {
    type: String,
    required: true,
  },
  poster: String,
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  isPrivate: {
    type: Boolean,
    default: false,
    index: true,
  },
  key: String,
  last_added: Date,
  item_count: {
    type: Number,
    default: 1,
  },
  list_type: {
    type: String,
    enum: ["custom", "favourite", "recommended", "watched"],
    default: "custom",
    index: true,
  },
  saved_count: {
    type: Number,
    default: 0,
  },
  createdAt: { type: Date, default: Date.now() },
});

listModel.index(
  {
    name: "text",
  },
  {
    background: true,
    weights: { name: 10 }, // Prioritize name matches
    name: "list_name_text_index",
    default_language: "english", // Handles stemming (e.g., "review" matches "reviews")
    collation: {
      locale: "en", // Case and punctuation-insensitive
      strength: 2,
    },
  }
);

const List = models.List || model("List", listModel);

export default List;

/*----- Pre defined ------
1. Favourites
2. Watched
3. Suggested
3. Private
4. Saved 
5. Contribute
*/
