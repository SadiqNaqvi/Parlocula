import { getRequest } from "@lib/helpers/common";
import { searchHandler } from "@lib/pipelines";
import { ObjectId } from "@lib/utils";
import { Follow } from "@model";

export const GET = getRequest(async (r, params) => {
  const { cuid } = params;
  return await searchHandler({
    r,
    collection: "users",
    DocModel: Follow,
    filters: [
      { $match: { followee: ObjectId(cuid), blocked: false } },
      {
        $lookup: {
          from: "users",
          as: "user",
          localField: "follower",
          foreignField: "_id",
        },
      },
      { $unwind: "user" },
      { $replaceRoot: { newRoot: "$user" } },
    ],
  });
});
