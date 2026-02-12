import { parloId } from "@lib/utils";
import { SanctionModelType, StrictModel } from "@type/models";
import { model, models } from "mongoose";
import { StrictSchema } from "./general";

const sanctionModel = new StrictSchema<SanctionModelType>({
    _id: { type: String, default: parloId },
    expiresAt: Date,
    metadata: Object,
    reason: { type: String, required: true },
    type: { type: String, enum: ["warning", "temp_ban", "perm_ban"], default: "warning" },
    userId: { type: String, ref: "User", required: true },
    active: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

sanctionModel.index({ expiresAt: 1 }, {
    expireAfterSeconds: 0,
    partialFilterExpression: { $exists: true }
});

const Sanction: StrictModel<SanctionModelType> =
    (models.Sanction as any) || model("Sanction", sanctionModel);

export default Sanction;
