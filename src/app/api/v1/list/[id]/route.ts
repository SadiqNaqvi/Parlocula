import { getRequest } from "@lib/actions/actions";
import { ObjectId } from "@lib/utils";
import { List } from "@model";

export const GET = getRequest(async (_, params: { id: string }) => {
  const { id } = params;

  const list = await List.findOne({
    _id: ObjectId(id),
    isPrivate: false,
  });

  if (list) return { success: true, result: list };
  return { success: false, errCode: "pp104" };
});