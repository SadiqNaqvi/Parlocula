import { getHandler } from "@lib/helpers/handlers";
import { bookmarkAggregationPipeline } from "@lib/pipelines";
import { getPageParams } from "@lib/utils";
import { Bookmark } from "@model";

// Get all saved comments of the current user
export const GET = getHandler(async (r, params) => {
  const page = getPageParams(r) - 1;
  const { cuid } = params;

  const response = await Bookmark.aggregate(
    bookmarkAggregationPipeline({
      filters: [
        { $match: { user_id: cuid, content_type: "Comment" } },
      ],
      type: "comment",
      page,
    })
  );

  return {
    success: true,
    result: response[0] ?? { data: [], total: 0 }
  };
});
