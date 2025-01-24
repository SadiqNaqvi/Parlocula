import { Schema } from "mongoose";

const reportModel = new Schema(
  {
    by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    for: {
      type: String,
      required: [true, "Reason for report is required."],
    },
  },
  { timestamps: true }
);
reportModel.index(
  { by: 1 },
  {
    unique: true,
    partialFilterExpression: { by: { $exists: true, $ne: null } },
  }
);

export { reportModel };

export const linkModel = new Schema({
  label: {
    type: String,
    required: [true, "Label for Link is required."],
  },
  url: {
    type: String,
    required: [true, "URL for a Link is required"],
  },
});

export const connectionModel = new Schema({
  media_type: { type: String, required: true },
  id: { type: String, required: true },
});
