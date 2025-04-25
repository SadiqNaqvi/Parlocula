import { getRequest } from "@lib/helpers/common";
import { threadsAggregationPipeline } from "@lib/pipelines";
import { getPageParams, ObjectId } from "@lib/utils";
import { Member } from "@model";

export const GET = getRequest(async (r: any, params: { cuid: string }) => {
  const page = getPageParams(r) - 1;
  const { cuid } = params;

  const result = await Member.aggregate(
    threadsAggregationPipeline({
      filters: [
        { $match: { user_id: ObjectId(cuid) } },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "threads",
            localField: "thread_id",
            foreignField: "_id",
            as: "threads",
          },
        },
        {
          $replaceRoot: {
            newRoot: { $arrayElemAt: ["$threads", 0] },
          },
        },
      ],
      page,
    })
  );

  return { result, success: true };
});
