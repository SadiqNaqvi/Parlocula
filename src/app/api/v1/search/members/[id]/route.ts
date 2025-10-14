import { getRequest } from "@lib/helpers/common";
import { usersAggregationPipeline } from "@lib/pipelines";
import { getPageParams, ObjectId } from "@lib/utils";
import { Member } from "@model";

// Search Members of a thread with thread_id (id).
export const GET = getRequest(async (r: any, params: { id: string }) => {
  const { id } = params;
  const page = getPageParams(r) - 1;

  const query: string | null = r.nextUrl.searchParams.get("q");
  if (!query || query.length < 3) return { success: false, errCode: "pp" };

  const searchTerms = query
    .split(/\s+/) // Split by spaces
    .map((term) => term.replace(/[^a-zA-Z0-9]/g, "")) // Remove punctuation
    .filter((term) => term.length > 0);

  const regex = searchTerms.map((s) => ({
    username: { $regex: s, $options: "i" },
  }));

  const response = await Member.aggregate(
    usersAggregationPipeline({
      filters: [
        { $match: { thread_id: ObjectId(id) } },
        {
          $lookup: {
            from: "users",
            as: "user",
            localField: "user_id",
            foreignField: "_id",
          },
        },
        { $addField: { username: { $arrayElemAt: ["user.username", 0] } } },
        { $match: { $or: regex } },
        { $unwind: "$user" },
        { $replaceRoot: { $newRoot: "$user" } },
      ],
      page,
      sort: { name: 1 },
    })
  );

  const result = response[0];
  if (!result) return { success: false, errCode: "resource_not_found" };
  return { success: true, result };
});
