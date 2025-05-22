import { ReportModelType } from "@type/models";
import { Schema, models, model } from "mongoose";

const reportModel = new Schema<ReportModelType>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reasons: {
      type: [String],
      required: true,
    },
    content_id: {
      type: Schema.Types.ObjectId,
      refPath: "content_type",
      required: true,
      index: true,
    },
    content_type: {
      type: String,
      enum: ["Post", "Comment", "User", "Thread"],
    },
  },
  { timestamps: true }
);

reportModel.index(
  { by: 1, content_id: 1 },
  {
    unique: true,
    partialFilterExpression: { user_id: { $exists: true, $ne: null } },
  }
);

const Report = models.Report || model("Report", reportModel);

export default Report;
