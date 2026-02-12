import { parloId } from "@lib/utils";
import { TaleonModelType, StrictModel } from "@type/models";
import { model, models } from "mongoose";
import { numberSchema, StrictSchema } from "./general";

export const taleonModel = new StrictSchema<TaleonModelType>({
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
  taleon_type: {
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
  editedAt: { type: Date, default: Date.now }
});

taleonModel.index({ ext_id: 1 }, { unique: true });

const Taleon: StrictModel<TaleonModelType> =
  (models.Taleon as any) || model("Taleon", taleonModel);

export default Taleon;
