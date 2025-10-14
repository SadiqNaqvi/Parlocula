import { getRequest } from "@lib/helpers/common";
import { Item } from "@model";
import { cookies } from "next/headers";

// Getting the list of user's lists which hava a specific media item, id = media_id
export const GET = getRequest(
  async (_, params: { id: string; cuid: string }) => {
    const { id, cuid } = params;

    if (!cuid) return { success: false, errCode: "unauthenticated_access" };

    const lists = await Item.find(
      { media_id: id, user_id: cuid },
      { list_id: 1 }
    );

    return { success: true, result: lists };
  }
);
