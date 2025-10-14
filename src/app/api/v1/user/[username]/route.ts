import { getRequest } from "@lib/helpers/common";
import { User } from "@model";

export const GET = getRequest(async (_, params) => {
  const { username } = params;

  const response = await User.aggregate([
    { $match: { username, isActive: true } },
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
                  { $ne: ["$list_type", "custom"] },
                ],
              },
            },
          },
        ],
        as: "predefine_lists",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        username: 1,
        profile: 1,
        bio: 1,
        bioLinks: 1,
        followers: 1,
        following: 1,
        posts: 1,
        comments: 1,
        public_lists: 1,
        predefine_lists: { _id: 1, name: 1, poster: 1 },
      },
    },
  ]);

  const result = response[0];
  if (!result) return { success: false, errCode: "resource_not_found" };

  return { result, success: true };
});
