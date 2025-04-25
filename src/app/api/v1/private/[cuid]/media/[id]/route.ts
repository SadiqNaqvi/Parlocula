import { getRequest } from "@lib/helpers/common";
import { Item } from "@model";
import { cookies } from "next/headers";

// Getting the list of user's lists which hava a specific media item, id = media_id
export const GET = getRequest(async (_, params: { id: string }) => {
  const cookieStore = cookies();
  const user_id = cookieStore.get("user_id")?.value;
  const { id } = params;

  if (!user_id) return { success: false, errCode: "pp202" };

  const lists = await Item.find({ media_id: id, user_id }, { list_id: 1 });

  return { success: true, result: lists };
});
