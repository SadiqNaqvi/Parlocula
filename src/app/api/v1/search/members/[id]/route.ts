import { getHandler } from "@lib/helpers/handlers";
import { convertMatchToLookupExpr, searchHandler } from "@lib/pipelines";

// Search Members of a thread with thread_id (id)

export const GET = getHandler(async (r, params) => {
  const { id } = params;

  return await searchHandler({
    r,
    filterInsideSearch: { isActive: true },
    filters: [
      {
        $lookup: {
          from: "members",
          let: { uid: "$_id" },
          pipeline: [
            convertMatchToLookupExpr({
              user_id: "$$uid",
              thread_id: id,
              banned: false,
            }),
            { $count: "exists" }
          ],
          as: "member"
        }
      },
      { $match: { $expr: { $eq: [{ $size: "$member" }, 1] } } },
      { $project: { member: 0 } }
    ],
    type: "users",
  });

});
