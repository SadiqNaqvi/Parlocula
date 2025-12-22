import { filterToSort } from "@lib/constants";
import { getHandler } from "@lib/helpers/handlers";
import { shelvesAggregationPipeline } from "@lib/pipelines";
import { getSearchParams } from "@lib/utils";
import { User } from "@model";

// Get all the public shelves of the user.
export const GET = getHandler(async (r, params) => {
  const { id } = params;

  const { page, filter } = getSearchParams(r.nextUrl, 0, "latest");

  const sort = filterToSort.shelves[filter] ?? filterToSort.shelves.latest;

  const response = await User.aggregate(
    shelvesAggregationPipeline({
      filters: [{ $match: { user_id: id, isPrivate: false } }],
      page,
      sort,
    })
  );

  return {
    success: true,
    result: response[0] ?? { data: [], total: 0 },
  };
});