import { getRequest } from "@lib/helpers/common";
import { filterToSort, queryLimit } from "@lib/constants";
import { ObjectId, getPageParams } from "@lib/utils";
import Item from "@model/items";
import { itemsAggregationPipeline } from "@lib/pipelines";

export const GET = getRequest(async (r: any, params: { id: string }) => {
  const { id } = params;
  const page = getPageParams(r) - 1;
  const filter = r.nextUrl.searchParams.get("f")?.trim() || "latest";
  const sort = filterToSort.items[filter] ?? filterToSort.items.latest;

  const items = await Item.aggregate(
    itemsAggregationPipeline({
      filters: [{ $match: { list_id: ObjectId(id) } }],
      page,
      sort,
    })
  );
  
  const result = items[0];

  if (!result) return { success: false, errCode: "pp104" };
  return { success: true, result };
});
