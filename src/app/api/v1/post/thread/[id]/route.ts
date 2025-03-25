import { getRequest } from "@lib/actions/actions";
import { filterToSort, queryLimit } from "@lib/constants";
import { ObjectId, getPageParams } from "@lib/utils";
import { Post } from "@model";
import { NextRequest } from "next/server";

export const GET = getRequest(
  async (r: NextRequest, params: { id: string }) => {
    const { id } = params;
    const page = getPageParams(r) - 1;
    const filter = r.nextUrl.searchParams.get("f")?.trim() || "latest";
    const sort = filterToSort.posts[filter] ?? filterToSort.posts.latest;

    const response = await Post.aggregate([
      { $match: { thread_id: ObjectId(id) } },
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
              $unwind: {
                path: "$user",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $addFields: {
                name: "$user.username",
                poster: "$user.profile",
                frame: {
                  $ifNull: [{ $arrayElemAt: ["$frames", 0] }, null],
                },
              },
            },
            {
              $project: {
                user: 0,
                user_id: 0,
                body: 0,
                frames: 0,
                links: 0,
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

    const posts = response[0];
    if (!posts) return { success: false, errCode: "pp104" };

    return {
      result: posts,
      success: true,
    };
  }
);

/*
THREAD
1. Hot - Descending date and user count
2. Popular - Descending user count and post count
3. Trending - Created within a week and descending post count
4. Newest 

POST
1. Hot - Descending date and views
2. Popular - Descending views, date and upvotes 
3. Controversial - Descending date and comments
4. Newest
*/
