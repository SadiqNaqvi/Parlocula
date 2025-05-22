import { filterToSort } from "@lib/constants";
import { getRequest } from "@lib/helpers/common";
import { threadsAggregationPipeline } from "@lib/pipelines";
import { getPageParams } from "@lib/utils";
import { Thread } from "@model";

export const GET = getRequest(async (r, { id }: { id: string }) => {
  const page = getPageParams(r) - 1;
  const filter = r.nextUrl.searchParams.get("f") || "latest";
  const sort = filterToSort.threads[filter] ?? filterToSort.threads.latest;

  const result = await Thread.aggregate(
    threadsAggregationPipeline({
      filters: [{ $match: { "connection.path": id } }],
      page,
      sort,
    })
  );

  const threads = result[0];
  if (!threads) return { success: false, errCode: "pp104" };
  return { result: threads, success: true };
});
