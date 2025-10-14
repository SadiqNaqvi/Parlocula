import { getRequest } from "@lib/helpers/common";
import { ObjectId } from "@lib/utils";
import { Post } from "@model";

export const GET = getRequest(async (r: any, params: { id: string }) => {
  const { id } = params;
  
  const result = await Post.aggregate([
    { $match: { _id: ObjectId(id) } },
    {
      $lookup: {
        from: "threads",
        localField: "thread_id",
        foreignField: "_id",
        as: "thread",
      },
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
        as: "repost",
        localField: "repost_id",
        foreignField: "_id",
      },
    },
    {
      $addFields: {
        username: { $ifNull: [{ $arrayElemAt: ["$user.username", 0] }, ""] },
        poster: { $ifNull: [{ $arrayElemAt: ["$thread.poster", 0] }, ""] },
      },
    },
    {
      $project: {
        user: 0,
        thread: 0,
      },
    },
  ]);

  const post = result[0];
  if (!post) return { success: false, errCode: "resource_not_found" };
  return { result: post, success: true };
});
