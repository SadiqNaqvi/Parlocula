import { getRequest, postRequest } from "@lib/helpers/common";
import { addItemsInList } from "@lib/helpers/server";
import { itemsForListSchema } from "@lib/schemas";
import { Item, List } from "@model";
import { MediaItemType } from "@type/internal";

// Fetching Private List
export const GET = getRequest(async (r: any, params: { id: string, cuid: string }) => {
  const { id, cuid } = params;

  const key = r.nextUrl.searchParams.get("k");

  const list = await List.findOne({ _id: id, isPrivate: true });

  if (!list) return { success: false, errCode: "pp104" };
  else if (list.user_id === cuid || key === list.key)
    return { success: true, result: list };

  return { success: false, errCode: "pp104" };
});

// Adding multiple Items in a list
export const POST = postRequest({
  handler: async ({ params, data, user_id, session }) => {
    const { id } = params;

    const { items } = data;
    const existing = await Item.find(
      {
        tmdb_id: { $in: items },
        list_id: id,
        user_id,
      },
      { tmdb_id: 1 },
      { session, ordered: true }
    );
    
    const existingMap = new Map(
      existing.map((el: { tmdb_id: string }) => [el.tmdb_id, true])
    );

    const itemsToAdd = items.filter(
      (el: MediaItemType) => !existingMap.get(el.tmdb_id)
    );

    await addItemsInList(itemsToAdd, id, user_id, session);

    return {
      success: true,
      result: null,
      available: "addItemsInList_lid",
      options: { lid: id },
    };
  },
  schema: itemsForListSchema,
});
