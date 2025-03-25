import { getRequest } from "@lib/actions/actions";
import { Media } from "@model";
import { cookies } from "next/headers";

export const GET = getRequest(async (_, params: { id: string }) => {
  const cookieStore = cookies();
  const user_id = cookieStore.get("user_id")?.value;
  const { id } = params;

  if (!user_id) return { success: false, errCode: "pp202" };

  const lists = await Media.find({ media_id: id, user_id });

  return { success: true, result: lists };
});
