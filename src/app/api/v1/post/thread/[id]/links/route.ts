import { getRequest } from "@lib/actions/actions";
import { filterToSort, queryLimit } from "@lib/constants";
import { ObjectId, getPageParams } from "@lib/utils";
import { Post } from "@model";

export const GET = getRequest(async (r: any, params: { id: string }) => {
  const { id } = params;

  const page = getPageParams(r) - 1;
  const filter = r.nextUrl.searchParams.get("f")?.trim() || "latest";
  const sort = filterToSort.posts[filter] ?? filterToSort.posts.latest;

  const result = await Post.aggregate([
    { $match: { thread_id: ObjectId(id), tag: "links" } },
    {
      $facet: {
        total: [{ $count: "count" }],
        data: [
          { $sort: sort },
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
          { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
          {
            $addFields: {
              name: "$user.username",
              poster: "$user.profile",
            },
          },
          {
            $project: {
              user: 0,
              user_id: 0,
              frames: 0,
              body: 0,
            },
          },
        ],
      },
    },
    { $unwind: "$total" },
    {
      $project: {
        total: "$total.count",
        data: 1,
      },
    },
  ]);

  return {
    result: result.pop() ?? { data: [], total: 0 },
    success: true,
    errCode: null,
  };
});
