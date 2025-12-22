import { filterToSort } from "@lib/constants";
import { getHandler } from "@lib/helpers/handlers";
import { attachNsfwInPipeline, postsAggregationPipeline } from "@lib/pipelines";
import { getSearchParams } from "@lib/utils";
import { Post } from "@model";

// Get Posts of a user by user_id
export const GET = getHandler(async (r, params) => {
  const { id } = params;

  const { page, nsfw, filter } = getSearchParams(r.nextUrl, 0, "latest");

  const sort = filterToSort.userPosts[filter] ?? filterToSort.userPosts.latest;

  const response = await Post.aggregate(
    postsAggregationPipeline({
      filters: [{ $match: attachNsfwInPipeline({ user_id: id }, nsfw) }],
      sort, page,
      excludeQuotedPost: false,
      isLinkBased: false,
    })
  );

  return {
    success: true,
    result: response[0] ?? { data: [], total: 0 },
  };
});
