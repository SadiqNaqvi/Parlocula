import { getRequest } from "@lib/helpers/common";
import { searchHandler } from "@lib/pipelines";
import { getPageParams, ObjectId } from "@lib/utils";
import { Follow } from "@model";

export const GET = getRequest(async (r, params) => {
  const { cuid } = params;
  return await searchHandler({
    r,
    collection: "users",
    DocModel: Follow,
    filters: [
      { $match: { follower: ObjectId(cuid), blocked: false } },
      {
        $lookup: {
          from: "users",
          as: "user",
          localField: "followee",
          foreignField: "_id",
        },
      },
      { $unwind: "user" },
      { $replaceRoot: { newRoot: "$user" } },
    ],
  });
});
