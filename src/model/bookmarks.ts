import { Schema, models, model } from "mongoose";

const bookmarkModel = new Schema({
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
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

bookmarkModel.index({ user_id: 1, content_id: 1 }, { unique: true });

const Bookmark = models.Bookmark || model("Bookmark", bookmarkModel);

export default Bookmark;