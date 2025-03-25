import { getRequest } from "@lib/actions/actions";
import { getPayloadFromToken } from "@lib/auth";
import { ObjectId } from "@lib/utils";
import { Member } from "@model";

export const GET = getRequest(async () => {
  const payload = getPayloadFromToken();
  if (!payload) return { result: null, success: false, errCode: "pp202" };
  const { user_id } = payload;

  const result = await Member.aggregate([
    { $match: { user_id: ObjectId(user_id) } },
    {
      $lookup: {
        from: "threads",
        as: "thread",
        foreignField: "_id",
        localField: "thread_id",
      },
    },
    { $unwind: "$thread" },
    {
      $addFields: {
        name: "$thread.name",
        poster: "$thread.poster",
      },
    },
    {
      $project: {
        thread: 0,
      },
    },
  ]);

  return { result, errCode: null, success: true };
});
