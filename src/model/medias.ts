import { CinementModelType } from "@type/models";
import { Schema, models, model } from "mongoose";

export const mediaModel = new Schema<CinementModelType>({
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
  favourite: {
    type: Number,
    default: 0,
    set: (val: number) => Math.max(val, 0),
  },
  watched: {
    type: Number,
    default: 0,
    set: (val: number) => Math.max(val, 0),
  },
  recommended: {
    type: Number,
    default: 0,
    set: (val: number) => Math.max(val, 0),
  },
});

const Media = models.Media || model("Media", mediaModel);
export default Media;
