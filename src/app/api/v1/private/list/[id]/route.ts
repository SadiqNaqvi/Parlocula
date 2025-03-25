import { getRequest, postRequest } from "@lib/actions/actions";
import { addItemsInList } from "@lib/actions/serverActions";
import { itemsForListSchema } from "@lib/schemas";
import { List } from "@model";
import { cookies } from "next/headers";

// Fetching Private List
export const GET = getRequest(async (r: any, params: { id: string }) => {
  const { id } = params;
  const cookieStore = cookies();
  const user_id = cookieStore.get("user_id");
  if (!user_id) return { success: false, errCode: "pp202" };

  const key = r.nextUrl.searchParams.get("k");

  const list = await List.findOne({ _id: id, isPrivate: true }).populate(
    "items",
    { total_rating: 0, rating_count: 0 }
  );

  if (!list) return { success: false, errCode: "pp104" };
  else if (list.user_id === user_id || key === list.key)
    return { success: true, result: list };

  return { success: false, errCode: "pp104" };
});

// Adding multiple Items in a list
export const POST = postRequest({
  handler: async ({ params, data, user_id, session }) => {
    const { id } = params;

    await addItemsInList(data.items, id, user_id, session);

    return {
      success: true,
      result: null,
      available: "addItemsInList_lid",
      options: { lid: id },
    };
  },
  schema: itemsForListSchema,
});
