import { queryLimit } from "@lib/constants";
import { getRequest } from "@lib/helpers/common";
import { getPageParams, ObjectId } from "@lib/utils";
import Participant from "@model/participants";

export const GET = getRequest(async (r, params) => {
    const searchParams = r.nextUrl.searchParams;
    const query: string | null = searchParams.get("q");
    const { cuid } = params;

    const page = getPageParams(r, 0);
    const user_id = ObjectId(cuid);

    const result = await Participant.aggregate([
        { $match: { user_id } },
        {
            $lookup: {
                from: "rooms",
                localField: "room_id",
                foreignField: "_id",
                as: "room"
            }
        },
        {
            $unwind: "$room"
        },
        {
            $addFields: {
                isGroup: { $eq: ["$room.type", "group"] },
            }
        },
        {
            $lookup: {
                from: "users",
                let: {
                    currentUserId: user_id,
                    participants: "$room.participants",
                    isGroup: "$isGroup",
                },
                as: "user",
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$$isGroup", false] },
                                    { $in: ["$_id", "$$participants"] },
                                    { $ne: ["$_id", "$$currentUserId"] }
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            profile: 1
                        }
                    },
                ]
            }
        },
        {
            $match: {
                $expr: {
                    $or: [
                        { $eq: ["$isGroup", true] },
                        { $eq: [{ $size: "$user" }, 1] },
                    ],
                },
            },
        },
        {
            $addFields: {
                display_name: {
                    $cond: {
                        if: "$isGroup",
                        then: "$room.name",
                        else: { $arrayElemAt: ["$user.username", 0] },
                    },
                },
                poster: {
                    $cond: {
                        if: "$isGroup",
                        then: "$room.poster",
                        else: { $arrayElemAt: ["$user.profile", 0] },
                    },
                },
            }
        },
        {
            $search: {
                index: "roomSearch",
                compound: {
                    should: {
                        autocomplete: {
                            query,
                            path: "display_name",
                            fuzzy: { maxEdits: 2, prefixLength: 1 },
                        },
                    },
                },
            },
        },
        {
            $addFields: {
                score: { $meta: "searchScore" },
            },
        },
        {
            $facet: {
                total: [{ $count: "count" }],
                data: [
                    { $sort: { score: -1 } },
                    { $skip: page * queryLimit },
                    { $limit: queryLimit },
                    {
                        $project: {
                            room_id: "$room._id",
                            display_name: 1,
                            poster: 1,
                        }
                    }
                ]
            }
        },
        {
            $project: {
                _id: 0,
                total: { $arrayElemAt: ["$total.count", 0] },
                data: 1,
            },
        }
    ]);

    return { success: true, result: result[0] ?? { data: [], total: 0 } }
});