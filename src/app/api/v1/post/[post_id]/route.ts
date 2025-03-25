import { getRequest } from "@lib/actions/actions";
import { ObjectId } from "@lib/utils";
import { Post } from "@model";

export const GET = getRequest(async (r: any, params: { post_id: string }) => {
  const { post_id } = params;
  const post = await Post.aggregate([
    { $match: { _id: ObjectId(post_id) } },
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
    { $unwind: { path: "$thread", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        username: "$user.username",
        poster: "$thread.poster",
      },
    },
    {
      $project: {
        user: 0,
        thread: 0,
      },
    },
  ]);
  return { result: post[0], success: true, errCode: null };
});
