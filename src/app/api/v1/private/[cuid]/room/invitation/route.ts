import { getRequest, postRequest } from "@lib/helpers/common";
import { getInvitationListFromCache, storeInvitationInCache } from "@lib/helpers/redis";
import { roomAggregationPipeline } from "@lib/pipelines";
import { getPageParams } from "@lib/utils";
import Participant from "@model/participants";

// Get all the rooms where the current user is invited
export const GET = getRequest(async (r, params) => {
  const page = getPageParams(r) - 1;
  const { cuid } = params;

  const cachedResult = await getInvitationListFromCache(cuid);
  console.log("cached result", cachedResult);
  if (cachedResult) return { success: true, result: cachedResult }

  const resp = await Participant.aggregate(
    roomAggregationPipeline({ invitation: true, page, cuid })
  );

  const result = resp[0];

  if (result && result.data.length) await storeInvitationInCache(cuid, result);

  return { success: true, result };
});
