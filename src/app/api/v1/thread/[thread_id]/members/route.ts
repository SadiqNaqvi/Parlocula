import { getRequest } from "@lib/helpers/common";
import { queryLimit } from "@lib/constants";
import { ObjectId, getPageParams } from "@lib/utils";
import { Member } from "@model";

export const GET = getRequest(async (r: any, params: { thread_id: string }) => {
  const { thread_id } = params;
  const page = getPageParams(r, 1) - 1;
  const result = await Member.aggregate([
    {
      $match: { thread_id: ObjectId(thread_id) },
    },
    {
      $facet: {
        total: [{ $count: "count" }],
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: page * queryLimit },
          { $limit: queryLimit },
          {
            $lookup: {
              from: "users",
              localField: "user_id",
              foreignField: "_id",
              as: "user",
            },
          },
          { $unwind: "$user" },
          {
            $addFields: {
              username: "$user.username",
              profile: "$user.profile",
            },
          },
          { $project: { user: 0, user_id: 0 } },
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

  const members = result[0];
  if (!members) return { success: false, errCode: "pp104" };

  return {
    result: result[0],
    success: true,
  };
});
