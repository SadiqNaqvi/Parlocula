import { availablePostCategories, filterToSort } from "@lib/constants";
import { getHandler } from "@lib/helpers/handlers";
import { attachNsfwInPipeline, postsAggregationPipeline } from "@lib/pipelines";
import { getSearchParams } from "@lib/utils";
import { Post } from "@model";

// Get posts of a thread
export const GET = getHandler(async (r, params) => {
    const { id } = params;

    const { page, nsfw, filter } = getSearchParams(r.nextUrl, 1, "latest");

    const sort = filterToSort.posts[filter] ?? filterToSort.posts.latest;

    const { get } = r.nextUrl.searchParams;

    const categoryParam = get("c");
    const category = categoryParam && availablePostCategories.includes(categoryParam) ? categoryParam : ""

    const postTypeParam = get("t");
    const postType = postTypeParam && ["frames", "links"].includes(postTypeParam) ? postTypeParam : ""

    const filters = {
      thread_id: id,
      ...(
        postType ? { $expr: { $ne: [`$${postType}_count`, 0] } }
          :
          category ? { category } : {}
      )
    };

    const response = await Post.aggregate(
      postsAggregationPipeline({
        filters: [{ $match: attachNsfwInPipeline(filters, nsfw) }],
        excludeQuotedPost: false,
        sort,
        page,
        isLinkBased: postType === "links",
      })
    );

    return { result: response[0] ?? { data: [], total: 0 }, success: true };
  }
);