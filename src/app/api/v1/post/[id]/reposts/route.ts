import { getRequest } from "@lib/helpers/common";
import { postsAggregationPipeline } from "@lib/pipelines";
import { getPageParams, ObjectId } from "@lib/utils";
import { Post } from "@model";

export const GET = getRequest(async (r, params: { id: string }) => {
  const { id } = params;

  const page = getPageParams(r) - 1;

  const response = await Post.aggregate(
    postsAggregationPipeline({
      filters: [{ $match: { repost_id: ObjectId(id) } }],
      page,
      sort: { createdAt: -1 },
    })
  );

  return { result: response[0], success: true };
});
