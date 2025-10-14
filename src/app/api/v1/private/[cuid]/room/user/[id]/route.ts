import { getRequest } from "@lib/helpers/common";
import Room from "@model/rooms";

export const GET = getRequest(async (_, params) => {
  const { cuid, id } = params;

  const room = await Room.findOne({
    type: "private",
    participants: [id, cuid].sort(),
  });

  if (room) return { success: true, result: room };
  return { success: false, errCode: "resource_not_found" };
});
