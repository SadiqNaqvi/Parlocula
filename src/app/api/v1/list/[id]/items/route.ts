import { getRequest } from "@lib/actions/actions";
import { filterToSort, queryLimit } from "@lib/constants";
import { ObjectId, getPageParams } from "@lib/utils";
import Item from "@model/items";

export const GET = getRequest(async (r: any, params: { id: string }) => {
  const { id } = params;
  const page = getPageParams(r) - 1;
  const filter = r.nextUrl.searchParams.get("f")?.trim() || "latest";
  const sort = filterToSort.items[filter] ?? filterToSort.items.latest;

  const items = await Item.aggregate([
    { $match: { list_id: ObjectId(id) } },
    {
      $facet: {
        total: [{ $count: "count" }],
        data: [
          { $sort: sort },
          { $skip: page * queryLimit },
          { $limit: queryLimit },
          {
            $lookup: {
              from: "items",
              localField: "media_id",
              foreignField: "_id",
              as: "item",
            },
          },
          {
            $addFields: {
              title: { $arrayElemAt: ["$item.title", 0] },
              poster: {
                $ifNull: [{ $arrayElemAt: ["$item.poster", 0] }, ""],
              },
              tmdb_id: { $arrayElemAt: ["$user.tmdb_id", 0] },
            },
          },
        ],
      },
    },
  ]);
  const result = items[0];
  if (!result) return { success: false, errCode: "pp204" };
  return { success: true, result };
});
