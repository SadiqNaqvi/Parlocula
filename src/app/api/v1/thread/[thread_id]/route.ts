import { getRequest } from "@lib/helpers/common";
import { Thread } from "@model";
import { Types } from "mongoose";

export const GET = getRequest(async (r: any, params: { thread_id: string }) => {
  const { thread_id } = params;

  const results = await Thread.aggregate([
    { $match: { _id: new Types.ObjectId(thread_id) } },
    {
      $lookup: {
        from: "users",
        as: "user",
        localField: "created_by",
        foreignField: "_id",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        created_by: "$user.username",
      },
    },
    {
      $project: {
        user: 0,
      },
    },
  ]);

  if (!results.length) return { success: false, errCode: "pp104" };

  return { result: results[0], success: true };
});
