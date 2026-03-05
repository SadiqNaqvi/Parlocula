import { queryLimit } from "@lib/constants";
import { getHandler } from "@lib/helpers/handlers";
import { convertMatchToLookupExpr } from "@lib/pipelines";
import { getSearchParams } from "@lib/utils";
import { Room, User } from "@model";
import { AggregatedResponse } from "@type/internal";
import type { PipelineStage } from "@type/mongoose";

// Search all the rooms (private/group) of the current user
export const GET = getHandler(async (r, params) => {
    const { cuid } = params;

    const { query, page } = getSearchParams(r.nextUrl, 0);

    const createFilters = (paths: string[], index: string): PipelineStage[] => ([
        {
            $search: {
                index,
                compound: {
                    should: paths.map((path) => ({
                        autocomplete: {
                            query,
                            path,
                            fuzzy: { maxEdits: 2, prefixLength: 1 },
                        },
                    })),
                },
            },
        },
        {
            $addFields: {
                score: { $meta: "searchScore" },
            },
        },
        { $sort: { score: -1 } },
        { $skip: page * queryLimit },
        { $limit: 100 },
    ]);

    const roomPipeline = [
        ...createFilters(["name"], "searchIndexForRooms_name"),
        {
            $lookup: {
                from: "participants",
                let: { rmid: "$_id" },
                pipeline: [
                    convertMatchToLookupExpr({
                        user_id: cuid,
                        room_id: "$$rmid"
                    }),
                    { $count: "exists" }
                ],
                as: "participant"
            },
        },
        { $match: { $expr: { $eq: [{ $size: "$participant" }, 1] } } },
        {
            $facet: {
                total: [{ $count: "total" }],
                data: [
                    { $limit: queryLimit },
                    {
                        $project: {
                            _id: 1,
                            poster: 1,
                            display_name: "$name"
                        }
                    }
                ]
            }
        },
        {
            $project: {
                total: {
                    $arrayElemAt: ["$total.total", 0]
                },
                data: 1
            }
        }
    ];

    const userPipeline = [
        ...createFilters(["name", "username"], "searchIndexForUsers_username_name"),
        {
            $addFields: {
                participants: {
                    $sortArray: {
                        input: ["$_id", cuid],
                        sortBy: 1
                    }
                }
            }
        },
        {
            $lookup: {
                from: "rooms",
                let: { participants: "$participants" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: [
                                    "$participants",
                                    "$$participants"
                                ]
                            }
                        }
                    },
                    { $project: { _id: 1 } }
                ],
                as: "room"
            }
        },
        {
            $match: {
                $expr: { $eq: [{ $size: "$room" }, 1] }
            }
        },
        {
            $facet: {
                total: [{ $count: "total" }],
                data: [
                    {
                        $project: {
                            _id: { $arrayElemAt: ["$room._id", 0] },
                            display_name: "$username",
                            poster: "$profile"
                        }
                    }
                ]
            }
        },
        {
            $project: {
                total: {
                    $arrayElemAt: ["$total.total", 0]
                },
                data: 1
            }
        }
    ];

    const [roomsResponse, usersResponse] = await Promise.all([
        Room.aggregate<AggregatedResponse>(roomPipeline),
        User.aggregate<AggregatedResponse>(userPipeline)
    ]);

    const roomResult = roomsResponse[0];
    const userResult = usersResponse[0];

    const data = [...(roomResult.data || []), ... (userResult.data || [])];
    const total = (roomResult.total || 0) + (userResult.total || 0);

    return { success: true, result: { data, total } }
});