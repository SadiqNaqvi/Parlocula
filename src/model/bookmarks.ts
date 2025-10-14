import { BookmarkModelType, StrictModel } from "@type/models";
import { Schema, models, model } from "mongoose";
import { StrictSchema } from "./general";

const bookmarkModel = new StrictSchema<BookmarkModelType>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  content_id: {
    type: Schema.Types.ObjectId,
    refPath: "content_type",
    required: true,
    index: true,
  },
  content_type: {
    type: String,
    enum: ["Post", "Comment", "List"],
  },
  createdAt: { type: Date, default: Date.now },
});

bookmarkModel.index({ user_id: 1, content_id: 1 }, { unique: true });

const Bookmark: StrictModel<BookmarkModelType> =
  (models.Bookmark as StrictModel<BookmarkModelType>) ||
  (model<BookmarkModelType>(
    "Bookmark",
    bookmarkModel
  ) as StrictModel<BookmarkModelType>);

export default Bookmark;
