import { CinementModelType, StrictModel } from "@type/models";
import { model, models } from "mongoose";
import { StrictSchema } from "./general";

export const mediaModel = new StrictSchema<CinementModelType>({
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

const Media: StrictModel<CinementModelType> =
  (models.Media as StrictModel<CinementModelType>) ||
  (model<CinementModelType>(
    "Media",
    mediaModel
  ) as StrictModel<CinementModelType>);

export default Media;
