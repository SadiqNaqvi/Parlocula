import { getRequest, postRequest } from "@lib/actions/actions";
import { addItemsInList } from "@lib/actions/serverActions";
import { listServerSchema } from "@lib/schemas";
import { List } from "@model";
import { cookies } from "next/headers";

export const GET = getRequest(async () => {
  const cookieStore = cookies();
  const user_id = cookieStore.get("user_id");
  if (!user_id) return { success: false, errCode: "pp202" };

  const lists = await List.find(
    { user_id, isPrivate: true },
    { items: 0, user_id: 0, isPrivate: 0, save_count: 0 }
  );

  return { success: true, result: lists ?? [] };
});

export const POST = postRequest({
  handler: async ({ data, frames, session, user_id }) => {
    const listKey = data.isPrivate
      ? crypto.randomUUID().replaceAll("-", "")
      : null;

    const { items, ...rest } = data;

    const dataToSave = {
      ...rest,
      poster: frames[0] ?? "",
      key: listKey,
      user_id,
    };

    const list = (await List.create([dataToSave], { session }))[0];

    await addItemsInList(items, list._id, user_id, session);

    return {
      success: true,
      available: "listCreation_lid",
      options: { lid: list._id },
      result: list,
    };
  },
  schema: listServerSchema,
});
