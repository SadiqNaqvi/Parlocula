import { getRequest } from "@lib/actions/actions";
import { filterToSort, queryLimit } from "@lib/constants";
import { getPageParams } from "@lib/utils";
import { Thread } from "@model";
import { NextRequest } from "next/server";

export const GET = getRequest(async (r: NextRequest) => {
  const page = getPageParams(r) - 1;
  const filter = r.nextUrl.searchParams.get("f") || "latest";
  const sort = filterToSort.threads[filter] ?? filterToSort.threads.latest;

  const threads = await Thread.aggregate([
    {
      $facet: {
        total: [{ $count: "total" }],
        data: [
          { $sort: sort },
          { $skip: page * queryLimit },
          { $limit: queryLimit },
          {
            $project: {
              name: 1,
              nsfw: 1,
              description: 1,
              user_count: 1,
              post_count: 1,
              poster: 1,
            },
          },
        ],
      },
    },
    { $unwind: "$total" },
    {
      $project: {
        data: 1,
        total: "$total.total",
      },
    },
  ]);

  return {
    result: threads[0] ?? { data: [], total: 0 },
    success: true,
    errCode: null,
  };
});
