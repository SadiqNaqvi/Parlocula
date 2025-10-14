import { queryLimit } from "@lib/constants";
import { getRequest } from "@lib/helpers/common";
import { getPageParams, ObjectId } from "@lib/utils";
import Notification from "@model/notifications";

export const GET = getRequest(async (r, params) => {
  const page = getPageParams(r, 0);

  const { cuid } = params;

  const response = await Notification.aggregate([
    { $match: { user_id: ObjectId(cuid) } },
    {
      $facet: {
        total: [{ $count: "count" }],
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: page * queryLimit },
          { $limit: queryLimit },
        ],
      },
    },
    {
      $project: {
        data: 1,
        total: { $arrayElemAt: ["$total.total", 0] },
      },
    },
  ]);

  const result = response[0] ?? { data: [], total: 0 };

  return { success: true, result };
});
