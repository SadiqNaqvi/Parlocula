import { getRequest } from "@lib/actions/actions";
import { User } from "@model";

export const GET = getRequest(async (r: any, params: { username: string }) => {
  const { username } = params;

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
    {
      $project: {
        lists: 1,
      },
    },
    { $unwind: "$lists" },
    { $project: { user_id: 0, isPrivate: 0, save_count: 0 } },
    {
      $group: {
        _id: "$_id",
        lists: { $push: "$lists" },
      },
    },
  ]);

  const result = lists[0]?.lists ?? [];

  return { result, success: true };
});
