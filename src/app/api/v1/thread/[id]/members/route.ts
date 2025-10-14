import { getRequest } from "@lib/helpers/common";
import { membersAggregationPipeline } from "@lib/pipelines";
import { ObjectId, getPageParams } from "@lib/utils";
import { Member } from "@model";

// Get all the members of a thread
export const GET = getRequest(async (r: any, params: { id: string }) => {
  const { id } = params;
  const page = getPageParams(r, 1) - 1;
  const result = await Member.aggregate(
    membersAggregationPipeline({
      filters: [
        {
          $match: { thread_id: ObjectId(id), banned: false },
        },
      ],
      page,
      sort: { createdAt: -1 },
    })
  );

  const members = result[0];
  if (!members) return { success: false, errCode: "resource_not_found" };

  return { result: members, success: true };
});
