import { filterToSort, postTags } from "@lib/constants";
import { getRequest } from "@lib/helpers/common";
import { postsAggregationPipeline } from "@lib/pipelines";
import { ObjectId, getPageParams } from "@lib/utils";
import { Post } from "@model";
import { NextRequest } from "next/server";

export const GET = getRequest(
  async (r: NextRequest, params: { id: string }) => {
    const { id } = params;

    const page = getPageParams(r) - 1;

    const searchParams = r.nextUrl.searchParams;
    const filter = searchParams.get("f")?.trim() || "latest";
    const tag = searchParams.get("t");

    const sort = filterToSort.posts[filter] ?? filterToSort.posts.latest;

    const filters: any = { thread_id: ObjectId(id) };
    if (tag && postTags.includes(tag)) filters.tag = tag;

    console.log("filters", filters);

    const response = await Post.aggregate(
      postsAggregationPipeline({
        filters: [{ $match: filters }],
        sort,
        page,
        isLinkBased: tag === "links",
      })
    );

    const posts = response[0];
    if (!posts) return { success: false, errCode: "resource_not_found" };

    return { result: posts, success: true };
  }
);

/*
THREAD
1. Hot - Descending date and user count
2. Popular - Descending user count and post count
3. Trending - Created within a week and descending post count
4. Newest 

POST
1. Hot - Descending date and views
2. Popular - Descending views, date and upvotes 
3. Controversial - Descending date and comments
4. Newest
*/
