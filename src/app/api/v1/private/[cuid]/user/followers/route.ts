import { getRequest } from "@lib/helpers/common";
import { usersAggregationPipeline } from "@lib/pipelines";
import { getPageParams, ObjectId } from "@lib/utils";
import { Follow } from "@model";

export const GET = getRequest(async (r, params) => {
  const { cuid } = params;
  const page = getPageParams(r) - 1;

  const resp = await Follow.aggregate(
    usersAggregationPipeline({
      filters: [
        { $match: { followee: ObjectId(cuid) } },
        {
          $lookup: {
            from: "users",
            as: "user",
            localField: "follower",
            foreignField: "_id",
          },
        },
        { $unwind: "$user" },
        { $replaceRoot: { newRoot: "$user" } },
      ],
      page,
      sort: { createdAt: -1 },
    })
  );

  const result = resp[0] ?? { data: [], total: 0 };
  return { success: true, result };
});
