import { getRequest } from "@lib/helpers/common";
import { ObjectId } from "@lib/utils";
import { List } from "@model";

export const GET = getRequest(async (_, params: { id: string }) => {
  const { id } = params;

  const list = await List.aggregate([
    {
      $match: { _id: ObjectId(id), isPrivate: false },
    },
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
        from: "items",
        localField: "_id",
        foreignField: "list_id",
        pipeline: [
          {
            $sort: { createdAt: -1 },
          },
          {
            $limit: 1,
          },
        ],
        as: "item",
      },
    },
    {
      $lookup: {
        from: "media",
        localField: "item.media_id",
        foreignField: "_id",
        as: "media",
      },
    },
    {
      $addFields: {
        username: {
          $arrayElemAt: ["$user.username", 0],
        },
        poster: {
          $arrayElemAt: ["$media.poster", 0],
        },
      },
    },
    {
      $project: { user: 0, item: 0, media: 0 },
    },
  ]);

  if (list.length) return { success: true, result: list[0] };
  return { success: false, errCode: "pp104" };
});
