import { queryLimit } from "@lib/constants";
import { getRequest } from "@lib/helpers/common";
import { getPageParams } from "@lib/utils";
import { User } from "@model";

export const GET = getRequest(async (r, params) => {

    const { cuid } = params;
    const page = getPageParams(r) - 1;
    const query = r.nextUrl.searchParams.get("q");

    const result = await User.aggregate([
        // {
        //     $search: {
        //         index: "roomSearch",
        //         compound: {
        //             should: {
        //                 autocomplete: {
        //                     query,
        //                     path: "username",
        //                     fuzzy: { maxEdits: 2, prefixLength: 1 },
        //                 },
        //             },
        //         },
        //     },
        // },
        // NEEDTEXTSEARCH
        { $match: { username: { $regex: query, $options: "i" } } },
        {
            $lookup: {
                from: "follows",
                as: "connection",
                let: { cuid, ruid: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$follower", "$$cuid"] },
                                    { $eq: ["$following", "$$ruid"] }
                                ]
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                isBlocked: { $arrayElemAt: ["$connection.blocked", 0] }
            }
        },
        { $match: { isBlocked: { $ne: true } } },
        {
            $facet: {
                total: [{ $count: "count" }],
                data: [
                    { $skip: page * queryLimit },
                    { $limit: queryLimit },
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            profile: 1,
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
        },
    ]);

    return { success: true, result: result[0] ?? { data: [], total: 0 } }
})