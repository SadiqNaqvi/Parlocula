import { ListModelType, StrictModel } from "@type/models";
import { Schema, model, models } from "mongoose";

const listModel = new Schema<ListModelType>({
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
  listKey: String,
  last_added: Date,
  item_count: {
    type: Number,
    default: 1,
    set: (value: number) => Math.max(value, 1),
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
  collaborators: [Schema.Types.ObjectId],
  invitees: [Schema.Types.ObjectId],
  createdAt: { type: Date, default: Date.now },
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

const List: StrictModel<ListModelType> =
  (models.List as StrictModel<ListModelType>) ||
  (model<ListModelType>("List", listModel) as StrictModel<ListModelType>);

export default List;

/*----- Pre defined ------
1. Favourites
2. Watched
3. Suggested
3. Private
4. Saved 
5. Contribute
*/
