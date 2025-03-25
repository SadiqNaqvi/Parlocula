import { Schema, models, model } from "mongoose";

const mediaModel = new Schema({
  title: {
    type: String,
    required: true,
  },
  poster: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  media_type: {
    type: String,
    enum: ["movie", "show"],
    required: true,
  },
  tmdb_id: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  total_rating: Number,
  rating_count: {
    type: Number,
    default: 0,
  },
});

mediaModel.index({ tmdb_id: 1 }, { unique: true });

const Media = models.Media || model("Media", mediaModel);
export { mediaModel };
export default Media;
