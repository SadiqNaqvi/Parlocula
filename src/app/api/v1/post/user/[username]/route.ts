import { filterToSort } from "@lib/constants";
import { getRequest } from "@lib/helpers/common";
import { postsAggregationPipeline } from "@lib/pipelines";
import { getPageParams } from "@lib/utils";
import { User } from "@model";

export const GET = getRequest(async (r: any, params: { username: string }) => {
  const { username } = params;
  const page = getPageParams(r) - 1;
  const filter = r.nextUrl.searchParams.get("f")?.trim() || "latest";
  const sort = filterToSort.userPosts[filter] ?? filterToSort.userPosts.latest;

  const filters = [
    { $match: { username } },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "user_id",
        as: "posts",
      },
    },
    { $unwind: "$posts" },
    {
      $replaceRoot: { newRoot: "$posts" },
    },
  ];

  const response = await User.aggregate(
    postsAggregationPipeline({ filters, sort, page })
  );

  const posts = response[0];
  if (!posts) return { success: false, errCode: "resource_not_found" };

  return { result: posts, success: true };
});
