import { filterToSort } from "@lib/constants";
import { getRequest } from "@lib/helpers/common";
import { commentsAggregationPipeline } from "@lib/pipelines";
import { getPageParams, ObjectId } from "@lib/utils";
import { Comment } from "@model";

export const GET = getRequest(async (r: any, params: { id: string }) => {
  const { id } = params;
  const page = getPageParams(r) - 1;
  const filter = r.nextUrl.searchParams.get("f")?.trim() || "latest";
  const sort = filterToSort.comments[filter] ?? filterToSort.comments.latest;

  const results = await Comment.aggregate(
    commentsAggregationPipeline({
      filters: [{ $match: { replied_to: ObjectId(id) } }],
      sort,
      page,
    })
  );

  const comments = results[0];
  if (!comments) return { success: false, errCode: "pp104" };

  return { result: comments, success: true };
});
