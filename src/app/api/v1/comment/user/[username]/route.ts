import { filterToSort } from "@lib/constants";
import { getRequest } from "@lib/helpers/common";
import {
    commentsAggregationPipeline
} from "@lib/pipelines";
import { getPageParams } from "@lib/utils";
import { User } from "@model";

export const GET = getRequest(async (r: any, params: { username: string }) => {
  const { username } = params;
  const page = getPageParams(r) - 1;
  const filter = r.nextUrl.searchParams.get("f")?.trim() || "loved";
  const sort = filterToSort.comments[filter] ?? filterToSort.comments.loved;

  const filters = [
    { $match: { username } },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "user_id",
        as: "comments",
      },
    },
    {$unwind: "$comments"},
    {
      $replaceRoot: {newRoot: "$comments"},
    },
  ];

  const response = await User.aggregate(
    commentsAggregationPipeline({ filters, sort, page })
  );

  const posts = response[0];
  if (!posts) return { success: false, errCode: "resource_not_found" };

  return { result: posts, success: true };
});
