import { ReportModelType, StrictModel } from "@type/models";
import { Schema, models, model } from "mongoose";
import { StrictSchema } from "./general";

const reportModel = new StrictSchema<ReportModelType>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "Report",
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
    },
    details: String,
    ext_id: { type: Schema.Types.ObjectId, index: true, required: false },
    content_id: {
      type: Schema.Types.ObjectId,
      refPath: "content_type",
      required: true,
      index: true,
    },
    content_type: {
      type: String,
      enum: ["Post", "Comment", "User", "Thread"],
      index: true,
    },
  },
  { timestamps: true }
);

reportModel.index(
  { Report_id: 1, content_id: 1 },
  {
    unique: true,
    partialFilterExpression: { Report_id: { $exists: true, $ne: null } },
  }
);

const Report: StrictModel<ReportModelType> =
  (models.Report as StrictModel<ReportModelType>) ||
  (model<ReportModelType>(
    "Report",
    reportModel
  ) as StrictModel<ReportModelType>);

export default Report;
