import { getRequest } from "@lib/actions/actions";
import { filterToSort, queryLimit } from "@lib/constants";
import { ObjectId, getPageParams } from "@lib/utils";
import { Comment } from "@model";

export const GET = getRequest(async (r: any, params: { id: string }) => {
  const { id } = params;
  const page = getPageParams(r) - 1;
  const filter = r.nextUrl.searchParams.get("f")?.trim() || "latest";
  const sort = filterToSort.comments[filter] ?? filterToSort.comments.latest;

  const comments = await Comment.aggregate([
    { $match: { post_id: ObjectId(id) } },
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
          {
            $lookup: {
              from: "comments",
              localField: "replied_to",
              foreignField: "_id",
              as: "reply",
            },
          },
          {
            $unwind: {
              path: "$reply",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $addFields: {
              username: {
                $ifNull: [{ $arrayElemAt: ["$user.username", 0] }, ""],
              },
              profile: {
                $ifNull: [{ $arrayElemAt: ["$user.profile", 0] }, ""],
              },
              parent: {
                $substr: [{ $ifNull: ["$reply.content", ""] }, 0, 50],
              },
            },
          },
          {
            $project: {
              user_id: 0,
              user: 0,
              reply: 0,
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
    result: comments[0] ?? { data: [], total: 0 },
    success: true,
  };
});
