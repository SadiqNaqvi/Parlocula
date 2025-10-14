import { getRequest } from "@lib/helpers/common";
import { searchHandler } from "@lib/pipelines";
import { ObjectId } from "@lib/utils";
import { Member } from "@model";

export const GET = getRequest(async (r, params) => {
  const { id } = params;

  return await searchHandler({
    r,
    filters: [
      { $match: { thread_id: ObjectId(id), banned: true } },
      {
        $lookup: {
          from: "users",
          as: "user",
          localField: "user_id",
          foreignField: "_id",
        },
      },
      { $unwind: "$user" },
      { $replaceRoot: { newRoot: "$user" } },
    ],
    collection: "users",
    DocModel: Member,
  });
});
