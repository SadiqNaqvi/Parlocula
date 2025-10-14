import { getRequest } from "@lib/helpers/common";
import { ObjectId } from "@lib/utils";
import { Thread } from "@model";

export const GET = getRequest(async (r: any, params: { id: string }) => {
  const { id } = params;

  const results = await Thread.aggregate([
    { $match: { _id: ObjectId(id) } },
    {
      $lookup: {
        from: "users",
        as: "user",
        localField: "created_by",
        foreignField: "_id",
      },
    },
    {
      $addFields: {
        creator: { $ifNull: [{ arrayElemAt: ["$user.username", 0] }, ""] },
      },
    },
    {
      $project: {
        user: 0,
      },
    },
  ]);

  if (!results.length) return { success: false, errCode: "resource_not_found" };

  return { result: results[0], success: true };
});
