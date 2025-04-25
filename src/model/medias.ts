import { Schema, models, model } from "mongoose";

export const mediaModel = new Schema({
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
    index: true,
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

const Media = models.Media || model("Media", mediaModel);
export default Media;
