import {
  deleteRequest,
  getRequest,
  postRequest,
  updateRequest,
} from "@lib/helpers/common";
import { deleteLists } from "@lib/helpers/deletion";
import { addItemsInList } from "@lib/helpers/server";
import { itemsForListSchema, listEditSchema } from "@lib/schemas";
import { ObjectId } from "@lib/utils";
import { Item, List } from "@model";
import { MediaItemType } from "@type/internal";
import { ListEditSchema } from "@type/schemas";

// Fetching Private List
export const GET = getRequest(
  async (r: any, params: { id: string; cuid: string }) => {
    const { id, cuid } = params;

    const key = r.nextUrl.searchParams.get("k");

    const list = await List.findOne({ _id: id, isPrivate: true });

    if (!list) return { success: false, errCode: "pp104" };
    else if (list.user_id === cuid || key === list.key)
      return { success: true, result: list };

    return { success: false, errCode: "pp104" };
  }
);

// Adding multiple Items in a list
export const POST = postRequest({
  handler: async ({ params, data, user_id, session }) => {
    const { id } = params;

    const { items } = data;
    const existing = await Item.find(
      {
        tmdb_id: { $in: items.map((el: any) => el.tmdb_id) },
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

// Editing a list and deleting multiple items
export const PATCH = updateRequest({
  handler: async ({ params, data, session, user_id }) => {
    const { id } = params;

    const { itemsToDelete, ...update } = data as ListEditSchema;

    if (itemsToDelete && itemsToDelete.length)
      await Item.deleteMany(
        {
          _id: { $in: itemsToDelete },
          list_id: ObjectId(id),
          user_id: ObjectId(user_id),
        },
        { session, ordered: true }
      );

    await List.findByIdAndUpdate(
      ObjectId(id),
      {
        $set: { ...update },
        $inc: { item_count: -(itemsToDelete?.length ?? 0) },
      },
      { session, ordered: true }
    );

    return {
      files: [],
      success: true,
      result: null,
      available: "listUpdation_lid",
      options: { lid: id },
    };
  },
  schema: listEditSchema,
});

// Delete a list
export const DELETE = deleteRequest(async ({ params, session, username }) => {
  const { id, cuid } = params;

  await deleteLists({ _id: ObjectId(id), user_id: ObjectId(cuid) }, session);

  return {
    files: [],
    available: "listMutation_lid_username",
    options: { lid: id, username },
    success: true,
  };
});
