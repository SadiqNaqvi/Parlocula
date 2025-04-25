import { getRequest } from "@lib/helpers/common";
import { bookmarkAggregationPipeline } from "@lib/pipelines";
import { getPageParams, ObjectId } from "@lib/utils";
import { Bookmark } from "@model";

export const GET = getRequest(async (r: any, params: { cuid: string }) => {
  const page = getPageParams(r) - 1;
  const { cuid } = params;

  const result = (
    await Bookmark.aggregate(
      bookmarkAggregationPipeline({
        filters: [
          { $match: { user_id: ObjectId(cuid), content_type: "List" } },
        ],
        type: "list",
        page,
      })
    )
  )[0];

  return { success: true, result };
});
