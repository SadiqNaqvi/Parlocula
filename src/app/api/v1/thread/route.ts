import { getRequest } from "@lib/helpers/common";
import { filterToSort, queryLimit } from "@lib/constants";
import { getPageParams } from "@lib/utils";
import { Thread } from "@model";
import { NextRequest } from "next/server";
import { threadsAggregationPipeline } from "@lib/pipelines";

export const GET = getRequest(async (r: NextRequest) => {
  const page = getPageParams(r) - 1;
  const filter = r.nextUrl.searchParams.get("f") || "latest";
  const sort = filterToSort.threads[filter] ?? filterToSort.threads.latest;

  const result = await Thread.aggregate(
    threadsAggregationPipeline({
      filters: [],
      page,
      sort,
    })
  );

  const threads = result[0];
  if (!threads) return { success: false, errCode: "pp104" };
  return { result: threads, success: true };
});
