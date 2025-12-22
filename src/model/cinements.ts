import { parloId } from "@lib/utils";
import { CinementModelType, StrictModel } from "@type/models";
import { model, models } from "mongoose";
import { numberSchema, StrictSchema } from "./general";

export const cinementModel = new StrictSchema<CinementModelType>({
  _id: {
    type: String,
    default: parloId
  },
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
  cinement_type: {
    type: String,
    enum: ["movie", "show"],
    required: true,
  },
  ext_id: {
    type: String,
    required: true,
  },
  favourite: numberSchema,
  watched: numberSchema,
  recommended: numberSchema,
});

cinementModel.index({ ext_id: 1 }, { unique: true });

const Cinement: StrictModel<CinementModelType> =
  (models.Cinement as any) || model("Cinement", cinementModel);

export default Cinement;
