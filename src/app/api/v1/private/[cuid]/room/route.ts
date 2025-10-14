import { getRequest } from "@lib/helpers/common";
import { getRoomListFromCache, storeRoomList } from "@lib/helpers/redis";
import { roomAggregationPipeline } from "@lib/pipelines";
import { getPageParams } from "@lib/utils";
import Participant from "@model/participants";
import { RoomListResponse } from "@type/internal";

// Get Room list for the user
export const GET = getRequest(async (r, params) => {
  const { cuid } = params;
  const page = getPageParams(r) - 1;

  const roomList = page < 2 ? await getRoomListFromCache(cuid, page) : null;
  if (roomList) return { success: true, result: roomList };

  const resp = await Participant.aggregate(
    roomAggregationPipeline({ invitation: false, page, cuid })
  );

  const result: { data: RoomListResponse[]; total: number } | undefined = resp[0];

  if (result && result.data.length) await storeRoomList(cuid, result.data, result.total);

  return {
    success: true,
    result: result ?? { data: [], total: 0 },
  };
});
