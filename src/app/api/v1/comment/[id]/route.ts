import { getRequest } from "@lib/helpers/common";
import { ObjectId } from "@lib/utils";
import { Comment } from "@model";

export const GET = getRequest(async (r: any, params: { id: string }) => {
  const { id } = params;

  const result = await Comment.aggregate([
    {
      $match: { _id: ObjectId(id) },
    },
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "posts",
        localField: "post_id",
        foreignField: "_id",
        as: "post",
      },
    },
    {
      $addFields: {
        username: { $arrayElemAt: ["$user.username", 0] },
        post_author: { $arrayElemAt: ["$post.user_id", 0] },
        profile: { $arrayElemAt: ["$user.profile", 0] },
      },
    },
    { $project: { user: 0, post: 0 } },
  ]);
  const comment = result[0];
  if (!comment) return { success: false, errCode: "pp104" };

  return { result: comment, success: true };
});
