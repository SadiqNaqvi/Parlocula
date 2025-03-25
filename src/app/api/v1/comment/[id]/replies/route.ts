import { getRequest } from "@lib/actions/actions";
import { ObjectId } from "@lib/utils";
import { Comment } from "@model";

export const GET = getRequest(async (r: any, params: { id: string }) => {
  const { id } = params;
  const replies = await Comment.aggregate([
    { $match: { replied_to: ObjectId(id) } },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $addFields: {
        username: { $ifNull: [{ $arrayElemAt: ["$user.username", 0] }, ""] },
        profile: { $ifNull: [{ $arrayElemAt: ["$user.profile", 0] }, ""] },
      },
    },
    {
      $project: {
        user_id: 0,
        user: 0,
      },
    },
  ]);

  return { result: replies, success: true };
});
