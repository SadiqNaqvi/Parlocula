import { filterToSort } from "@lib/constants";
import { getHandler } from "@lib/helpers/handlers";
import { attachNsfwInPipeline, threadsAggregationPipeline } from "@lib/pipelines";
import { getSearchParams } from "@lib/utils";
import { Thread } from "@model";

// Get the threads based upon the taleon, here id = taleon id
export const GET = getHandler(async (r, { id }) => {

  const { filter, nsfw, page } = getSearchParams(r.nextUrl, 0, "latest");
  const sort = filterToSort.threads[filter] ?? filterToSort.threads.latest;

  const result = await Thread.aggregate(
    threadsAggregationPipeline({
      filters: [{ $match: attachNsfwInPipeline({ "connections.path": id }, nsfw) }],
      page,
      sort,
    })
  );

  const threads = result[0];

  // if (!threads) return { success: false, errCode: "resource_not_found" };
  return { result: threads, success: true };
});
