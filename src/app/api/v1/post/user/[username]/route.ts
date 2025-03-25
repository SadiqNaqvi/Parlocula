import { getRequest } from "@lib/actions/actions";
import { filterToSort, queryLimit } from "@lib/constants";
import { getPageParams } from "@lib/utils";
import { User } from "@model";

export const GET = getRequest(async (r: any, params: { username: string }) => {
  const { username } = params;
  const page = getPageParams(r) - 1;
  const filter = r.nextUrl.searchParams.get("f")?.trim() || "latest";
  const sort = filterToSort.userPosts[filter] ?? filterToSort.userPosts.latest;

  const posts = await User.aggregate([
    { $match: { username } },
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "user_id",
        as: "posts",
      },
    },
    {
      $project: {
        total: { $size: "$posts" },
        posts: {
          $slice: [
            {
              $sortArray: {
                input: "$posts",
                sortBy: sort,
              },
            },
            page * queryLimit,
            queryLimit,
          ],
        },
      },
    },
    { $unwind: "$posts" },
    {
      $lookup: {
        from: "threads",
        localField: "posts.thread_id",
        foreignField: "_id",
        as: "posts.thread",
      },
    },
    {
      $unwind: {
        path: "$posts.thread",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        posts: {
          name: "$posts.thread.name",
          poster: "$posts.thread.poster",
        },
      },
    },
    {
      $project: {
        posts: { thread: 0, user_id: 0 },
      },
    },
    {
      $group: {
        _id: "$_id",
        posts: { $push: "$posts" },
        total: { $first: "$total" },
      },
    },
  ]);

  const result = posts[0] ?? { data: [], total: 0 };

  return {
    result,
    success: true,
  };
});
