import { getRequest } from "@lib/helpers/common";
import { filterToSort, queryLimit } from "@lib/constants";
import { ObjectId, getPageParams } from "@lib/utils";
import { Comment } from "@model";
import { commentsAggregationPipelineWithReplies } from "@lib/pipelines";

export const GET = getRequest(async (r: any, params: { id: string }) => {
  const { id } = params;
  const page = getPageParams(r) - 1;
  const filter = r.nextUrl.searchParams.get("f")?.trim() || "latest";
  const sort = filterToSort.comments[filter] ?? filterToSort.comments.latest;

  const results = await Comment.aggregate(
    commentsAggregationPipelineWithReplies({
      filters: [{ $match: { post_id: ObjectId(id) } }],
      sort,
      page,
    })
  );

  const comments = results[0];
  if (!comments) return { success: false, errCode: "resource_not_found" };

  return { result: comments, success: true };
});
