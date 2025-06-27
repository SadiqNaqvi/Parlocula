import { queryLimit } from "@lib/constants";
import { getRequest } from "@lib/helpers/common";
import { getPageParams } from "@lib/utils";
import { User } from "@model";

// Get all the public lists of the user.
export const GET = getRequest(async (r: any, params: { username: string }) => {
  const { username } = params;
  const page = getPageParams(r) - 1;

  const lists = await User.aggregate([
    { $match: { username } },
    {
      $lookup: {
        from: "lists",
        let: { id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$user_id", "$$id"] },
                  { $eq: ["$isPrivate", false] },
                ],
              },
            },
          },
        ],
        as: "lists",
      },
    },
    { $unwind: "$lists" },
    {
      $project: {
        user_id: 0,
        isPrivate: 0,
        save_count: 0,
      },
    },
    {
      $replaceRoot: {
        newRoot: "$lists",
      },
    },
    {
      $facet: {
        total: [{ $count: "count" }],
        data: [{ $skip: page * queryLimit }, { $limit: queryLimit }],
      },
    },
    {
      $project: {
        total: { $arrayElemAt: ["$total.count", 0] },
        data: 1,
      },
    },
  ]);

  return { result: lists[0], success: true };
});