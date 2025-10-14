import { getRequest } from "@lib/helpers/common";
import { threadsAggregationPipeline } from "@lib/pipelines";
import { getPageParams, ObjectId } from "@lib/utils";
import { Member } from "@model";

// Get all the joined threads of the current user
export const GET = getRequest(async (r: any, params: { cuid: string }) => {
  const page = getPageParams(r) - 1;
  const { cuid } = params;

  const response = await Member.aggregate(
    threadsAggregationPipeline({
      filters: [
        { $match: { user_id: ObjectId(cuid), banned: false } },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "threads",
            localField: "thread_id",
            foreignField: "_id",
            as: "threads",
          },
        },
        { $unwind: "$threads" },
        {
          $replaceRoot: { newRoot: "$threads" },
        }
      ],
      page,
    })
  );

  return {
    result: response[0] ?? { data: [], total: 0 },
    success: true
  };
});
