import { Comment, Connection, Member, Post, Shelf, Thread, User } from "@model";
import { GeneralGetReturn } from "@type/internal";
import { PipelineFunc } from "@type/other";
import { FilterQuery, PipelineStage, Types } from "mongoose";
import { NextRequest } from "next/server";
import { oneDay, queryLimit } from "./constants";
import { createArray, getPageParams, getSearchParams } from "./utils";

type Collections = "users" | "posts" | "threads" | "comments" | "shelves";

export const userProjection = {
  username: 1,
  profile: 1,
  name: 1,
  followers: 1,
  posts: 1,
}

export const postProjection = {
  user: 0,
  thread: 0,
  user_id: 0,
  body: 0,
  links: 0,
}

export const threadProjection = {
  name: 1,
  nsfw: 1,
  member_count: 1,
  post_count: 1,
  poster: 1,
}

export const commentProjection = {
  user: 0,
  reply: 0,
  post_id: 0,
  edited_at: 0,
}

export const shelfProjection = {
  user_id: 0,
  save_count: 0,
  createdAt: 0,
  updatedAt: 0,
}

export const attachNsfwInPipeline = (obj: Object, nsfw: boolean) => {
  if (nsfw) return obj;
  return { ...obj, nsfw }
}

export const createPipeline = ({
  filters,
  page,
  projection,
  sort,
  preProjection,
  limit = queryLimit
}: {
  filters: PipelineStage[];
  page: number;
  sort: Record<string, number | string>;
  preProjection?: PipelineStage[];
  projection: Record<string, any>;
  limit?: number;
}): PipelineStage[] => [
    ...filters,
    {
      $facet: {
        total: [{ $count: "count" }],
        data: [
          ...(sort ? [{ $sort: sort }] : []),
          { $skip: page * limit },
          { $limit: limit },
          ...(preProjection ?? []),
          { $project: projection },
        ] as PipelineStage.FacetPipelineStage[],
      },
    },
    {
      $project: {
        _id: 0,
        total: { $arrayElemAt: ["$total.count", 0] },
        data: 1,
      },
    },
  ];

const projectionMap: Record<Collections, { [field: string]: number }> = {
  comments: commentProjection,
  posts: postProjection,
  shelves: shelfProjection,
  threads: threadProjection,
  users: userProjection
}

export const convertMatchToLookupExpr = <T = any>(matchObj: FilterQuery<T>): PipelineStage.Match => {
  const convertCondition = (key: string, value: any) => {
    // Primitive -> $eq
    if (typeof value !== "object" || value === null) {
      return { $eq: [`$${key}`, value] };
    }

    // Operators
    const expressions = [];

    for (const op in value) {
      const val = value[op];

      const operatorMap: Record<string, string> = {
        $eq: "$eq",
        $ne: "$ne",
        $gt: "$gt",
        $lt: "$lt",
        $gte: "$gte",
        $lte: "$lte",
        $in: "$in",
        $nin: "$nin",
      };

      if (!operatorMap[op]) {
        throw new Error(`Unsupported operator: ${op}`);
      }

      expressions.push({
        [operatorMap[op]]: [`$${key}`, val],
      });
    }

    // If only one operator → return directly
    return expressions.length === 1 ? expressions[0] : { $and: expressions };
  }

  const parse = (match: FilterQuery<T>): FilterQuery<T>["$expr"] => {
    const exprConditions = [];

    for (const key in match) {
      const value = match[key] as FilterQuery<T>[];

      // Handle logical operators at root
      if (key === "$and" || key === "$or") {
        exprConditions.push({
          [key]: value.map((item) => {
            const parsed = parse(item);
            return parsed.$expr || parsed;
          }),
        });
      } else {
        exprConditions.push(convertCondition(key, value));
      }
    }

    return {
      $expr: exprConditions.length === 1
        ? exprConditions[0]
        : { $and: exprConditions }
    };
  }

  return { $match: parse(matchObj) };
}

const lookupOrAndChangeRoot = (collection: Collections, forLookup: string | undefined, forReplaceRoot: string | undefined): PipelineStage[] => {
  if (!forLookup && !forReplaceRoot) return [];

  const project = projectionMap[collection];
  if (!project) throw new Error("invalid collection passed in lookupOrAndChangeRoot function");

  // This is to optimise performance, why lookup for all the documents when we need to skip & limit documents later. So first skip & limit then lookup and replace root.

  return createArray<PipelineStage>([])
    .concatConditionally(forLookup, (localField) => ({
      $lookup: {
        from: collection,
        localField,
        foreignField: "_id",
        pipeline: [{ $project: project }],
        as: collection,
      }
    })
    ).concatConditionally(Boolean(forReplaceRoot || forLookup), () => ({
      $replaceRoot: {
        newRoot: {
          $arrayElemAt: [`$${forReplaceRoot || collection}`, 0]
        }
      }
    }));

}

export const postsAggregationPipeline: PipelineFunc<{ isLinkBased: boolean; excludeQuotedPost: boolean }> = (
  { filters, sort, page = 1, isLinkBased, localFieldForLookup, replaceRoot, excludeQuotedPost }
) =>
  createPipeline({
    filters,
    sort,
    page,
    preProjection: [
      ...lookupOrAndChangeRoot("posts", localFieldForLookup, replaceRoot),
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          pipeline: [{ $project: { username: 1, profile: 1 } }],
          as: "user",
        },
      },
      {
        $lookup: {
          from: "threads",
          localField: "thread_id",
          foreignField: "_id",
          pipeline: [{ $project: { name: 1, poster: 1 } }],
          as: "thread",
        },
      },
      ...(excludeQuotedPost ? [] : [
        {
          $lookup: {
            from: "posts",
            localField: "quoted_post_id",
            foreignField: "_id",
            pipeline: [{ $project: { title: 1, frames_count: 1, links_count: 1 } }],
            as: "quoted_post",
          },
        }
      ]),
      {
        $addFields: {
          thread_name: { $arrayElemAt: ["$thread.name", 0] },
          username: { $arrayElemAt: ["$user.username", 0] },
          profile: { $arrayElemAt: ["$user.profile", 0] },
          poster: { $arrayElemAt: ["$thread.poster", 0] },
          quoted_post_title: { $ifNull: [{ $arrayElemAt: ["$quoted_post.title", 0] }, ""] },
          quoted_post_frames_count: { $ifNull: [{ $arrayElemAt: ["$quoted_post.frames_count", 0] }, 0] },
          quoted_post_links_count: { $ifNull: [{ $arrayElemAt: ["$quoted_post.links_count", 0] }, 0] }
        },
      },
    ],
    projection: {
      user: 0,
      thread: 0,
      user_id: 0,
      body: 0,
      [isLinkBased ? "frames" : "links"]: 0,
    },
  });

export const commentsAggregationPipelineWithReplies: PipelineFunc = (
  { filters, page, sort, localFieldForLookup, replaceRoot }
) =>
  createPipeline({
    filters,
    page,
    sort,
    preProjection: [
      ...lookupOrAndChangeRoot("comments", localFieldForLookup, replaceRoot),
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          pipeline: [{ $project: { username: 1, profile: 1 } }],
          as: "user",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "replied_to",
          foreignField: "_id",
          pipeline: [{ $project: { content: 1, attachment: 1 } }],
          as: "reply",
        },
      },
      {
        $addFields: {
          username: {
            $ifNull: [{ $arrayElemAt: ["$user.username", 0] }, ""],
          },
          profile: {
            $ifNull: [{ $arrayElemAt: ["$user.profile", 0] }, ""],
          },
          parentComment: {
            content: {
              $substr: [
                { $ifNull: [{ $arrayElemAt: ["$reply.content", 0] }, ""] },
                0,
                50,
              ],
            },
            attachment: {
              $ifNull: [{ $arrayElemAt: ["$reply.attachment", 0] }, ""]
            },
          },
        },
      },
    ],
    projection: commentProjection,
  });

export const commentsAggregationPipeline: PipelineFunc = (
  { filters, page, sort, localFieldForLookup, replaceRoot }
) =>
  createPipeline({
    filters,
    sort,
    page,
    preProjection: [
      ...lookupOrAndChangeRoot("comments", localFieldForLookup, replaceRoot),
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          pipeline: [{ $project: { username: 1, profile: 1 } }],
          as: "user",
        },
      },
      {
        $addFields: {
          username: {
            $ifNull: [{ $arrayElemAt: ["$user.username", 0] }, ""],
          },
          profile: {
            $ifNull: [{ $arrayElemAt: ["$user.profile", 0] }, ""],
          },
        },
      },
    ],
    projection: commentProjection,
  });

export const threadsAggregationPipeline: PipelineFunc = (
  { filters, page, sort, localFieldForLookup, replaceRoot }
) =>
  createPipeline({
    filters,
    sort,
    page,
    preProjection: lookupOrAndChangeRoot("threads", localFieldForLookup, replaceRoot),
    projection: threadProjection,
  });

export const shelvesAggregationPipeline: PipelineFunc = (
  { filters, page, sort, localFieldForLookup, replaceRoot }
) =>
  createPipeline({
    filters,
    sort,
    page,
    preProjection: lookupOrAndChangeRoot("shelves", localFieldForLookup, replaceRoot),
    projection: shelfProjection,
  });

export const itemsAggregationPipeline: PipelineFunc<{ shelf_creator: string }> = ({ filters, page, sort, shelf_creator }) =>
  createPipeline({
    filters,
    sort,
    page,
    preProjection: [
      {
        $lookup: {
          from: "cinements",
          localField: "cinement_id",
          foreignField: "_id",
          pipeline: [{ $project: { title: 1, cinement_type: 1, poster: 1 } }],
          as: "cinement",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          pipeline: [{ $project: { username: 1 } }],
          as: "user"
        }
      },
      {
        $addFields: {
          title: { $arrayElemAt: ["$cinement.title", 0] },
          cinement_type: { $arrayElemAt: ["$cinement.cinement_type", 0] },
          poster: { $arrayElemAt: ["$cinement.poster", 0] },
          added_by: {
            $cond: {
              if: { $eq: ["$user_id", shelf_creator] },
              then: undefined,
              else: { $arrayElemAt: ["$user.username", 0] },
            },
          },
        },
      },
    ],
    projection: { cinement: 0, user: 0 },
  });

export const usersAggregationPipeline: PipelineFunc = (
  { filters, page, sort, localFieldForLookup, replaceRoot, limit }
) =>
  createPipeline({
    filters,
    sort,
    page,
    preProjection: lookupOrAndChangeRoot("users", localFieldForLookup, replaceRoot),
    projection: userProjection,
    limit,
  });

export const bookmarkAggregationPipeline: PipelineFunc<{
  type: "post" | "shelf" | "comment";
}> = ({ filters, page, type, localFieldForLookup, replaceRoot }) => {
  const sort = { createdAt: -1 };
  if (type === "comment")
    return commentsAggregationPipeline({ filters, page, sort, localFieldForLookup, replaceRoot });
  else if (type === "shelf")
    return shelvesAggregationPipeline({ filters, page, sort, localFieldForLookup, replaceRoot });
  else if (type === "post")
    return postsAggregationPipeline({ filters, page, sort, localFieldForLookup, replaceRoot, excludeQuotedPost: true, isLinkBased: false });
  else return [];
};

export const currentUserPipeline = (filter: PipelineStage.Match["$match"]) => [
  { $match: filter },

  {
    $lookup: {
      from: "shelves",
      let: { id: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$user_id", "$$id"] },
                { $ne: ["$shelf_type", "custom"] },
              ],
            },
          },
        },
        { $project: shelfProjection }
      ],
      as: "predefinedShelves",
    },
  },

  {
    $project: {
      isActive: 0,
      lastLoginAt: 0,
      session_id: 0,
      passkey: 0,
    },
  },
];

export const getFollowersToNotify = async (user_id: string, limit = 50): Promise<{ follower: string }[]> => {
  return await Connection.aggregate([
    {
      $match: { followee: user_id, notification: true },
    },
    {
      $lookup: {
        from: "users",
        localField: "follower",
        foreignField: "_id",
        pipeline: [
          convertMatchToLookupExpr({ isActive: true }),
          { $project: { updatedAt: 1 } }
        ],
        as: "user",
      },
    },
    { $sort: { "user.updatedAt": -1 } },
    { $limit: limit },
    { $project: { follower: 1 } },
  ]);
};

export const getMembersToNotify = async (
  tid: string,
  limit = 50
): Promise<{ user_id: string }[]> => {
  return await Member.aggregate([
    {
      $match: { thread_id: tid, notification: true },
    },
    {
      $lookup: {
        from: "users",
        localField: "follower",
        foreignField: "_id",
        pipeline: [
          convertMatchToLookupExpr({ isActive: true }),
          { $project: { updatedAt: 1 } }
        ],
        as: "user",
      },
    },
    { $sort: { "$user.updatedAt": -1 } },
    { $limit: limit },
    { $project: { user_id: 1 } },
  ]);
};

const performAggregation = ({ filters, page, sort, type }: { filters: PipelineStage[], page: number, sort?: any, type: Collections }) => {
  if (type === "posts") return Post.aggregate(postsAggregationPipeline({ filters, page, sort, excludeQuotedPost: true, isLinkBased: false }));
  else if (type === "comments") return Comment.aggregate(commentsAggregationPipeline({ filters, page, sort }));
  else if (type === "shelves") return Shelf.aggregate(shelvesAggregationPipeline({ filters, page, sort }));
  else if (type === "threads") return Thread.aggregate(threadsAggregationPipeline({ filters, page, sort }));
  else return User.aggregate(usersAggregationPipeline({ filters, page, sort }));
}

type FilterInsideSearchType = Record<string, boolean | number | string>;

type SearchHandlerProps = {
  filters: PipelineStage[],
  type: Collections,
  r: NextRequest,
  applyNsfwCheck?: boolean,
  filterInsideSearch?: FilterInsideSearchType
}

const createSearchFilter = (filter: FilterInsideSearchType) => {
  return Object.entries(filter).map(([path, value]) => ({
    equals: { path, value }
  }));
}

export const searchHandler = async ({ r, type, filters, applyNsfwCheck, filterInsideSearch }: SearchHandlerProps): Promise<GeneralGetReturn> => {

  const { get } = r.nextUrl.searchParams;

  const query: string | null = get("q");
  if (!query) return { success: false, errCode: "unknown_error" };

  const { page, nsfw } = getSearchParams(r.nextUrl, 0);

  const isFiltering = nsfw === false;

  const pathsDict: Record<Collections, string[]> = {
    "users": ["username", "name"],
    "posts": ["title"],
    "threads": ["name"],
    "comments": ["content"],
    "shelves": ["name"],
  }

  const indexNameDict: Record<Collections, string> = {
    "users": "searchIndexForUsers_username_name",
    "posts": "searchIndexForPosts_title",
    "threads": "searchIndexForThreads_name",
    "comments": "searchIndexForComments_content",
    "shelves": "searchIndexForShelves_name",
  }

  const paths = pathsDict[type];
  const index = indexNameDict[type];

  if (!paths || !index) throw new Error(`Incorrect type passed in search handler, got: ${type}`)

  const searchFilters: PipelineStage[] = [
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
          filter: (applyNsfwCheck || filterInsideSearch) ? createSearchFilter({
            ...(applyNsfwCheck && isFiltering && { nsfw }),
            ...(filterInsideSearch && filterInsideSearch),
          }) : undefined,
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
    ...filters
  ];

  const response = await performAggregation({ filters: searchFilters, page, type });

  return { success: true, result: response[0] ?? { data: [], total: 0 } }

}

export const roomAggregationPipeline = ({ invitation, page, cuid, }: { invitation: boolean; page: number; cuid: string; }) =>
  createPipeline({
    filters: [
      {
        $match: {
          user_id: cuid,
          type: invitation ? { $eq: "invitee" } : { $ne: "invitee" },
        },
      },
      {
        $lookup: {
          from: "rooms",
          let: { hideAt: "$hideAt", room_id: "$room_id" },
          pipeline: [
            convertMatchToLookupExpr({ _id: "$$room_id", $gt: ["$lastMessageAt", "$$hideAt"] }),
            {
              $project: {
                type: 1,
                lastMessageBy: 1,
                lastMessageAt: 1,
                invitationMessage: 1,
              }
            }
          ],
          as: "room",
        },
      },
      // { $match: { "room.0": { $exists: true } } },
    ],
    preProjection: [
      {
        $addFields: {
          isGroup: { $eq: ["$room.type", "group"] },
        },
      },
      {
        $lookup: {
          from: "participants",
          let: { room_id: "$room_id", isGroup: "$isGroup" },
          pipeline: [
            convertMatchToLookupExpr({
              "$isGroup": false,
              room_id: "$$room_id",
              user_id: cuid
            }),
            { $limit: 1 },
            { $project: { user_id: 1, seen_at: 1 } }
          ],
          as: "participant",
        },
      },
      {
        $lookup: {
          from: "users",
          let: {
            uid: { $arrayElemAt: ["$participant.user_id", 0] },
            isGroup: "$isGroup",
          },
          pipeline: [
            convertMatchToLookupExpr({
              "$isGroup": false,
              _id: "$$uid"
            }),
            { $project: { username: 1, profile: 1 } }
          ],
          as: "user",
        },
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
              then: "$name",
              else: { $arrayElemAt: ["$user.username", 0] },
            },
          },
          poster: {
            $cond: {
              if: "$isGroup",
              then: "$poster",
              else: { $arrayElemAt: ["$user.profile", 0] },
            },
          },
          otherParticipant_seenAt: {
            $cond: {
              if: "$isGroup",
              then: 0,
              else: { $arrayElemAt: ["$participant.seenAt", 0] },
            },
          },
          otherParticipant_id: {
            $cond: {
              if: "$isGroup",
              then: null,
              else: { $arrayElemAt: ["$participant.user_id", 0] },
            },
          },
          room_type: {
            $arrayElemAt: ["$room.type", 0],
          },
          lastMessageBy: {
            $arrayElemAt: ["$room.lastMessageBy", 0],
          },
          lastMessageAt: {
            $arrayElemAt: ["$room.lastMessageAt", 0],
          },
          invitationMessage: {
            $arrayElemAt: ["$room.invitationMessage", 0],
          },
        },
      },
    ],
    page,
    sort: { lastMessageAt: -1 },
    projection: {
      display_name: 1,
      user_id: 1,
      poster: 1,
      seenAt: 1,
      type: 1,
      otherParticipant_id: 1,
      otherParticipant_seenAt: 1,
      lastMessageBy: 1,
      lastMessageAt: 1,
      lastMessage: 1,
      invitationMessage: 1,
      mute: 1,
      room_id: 1,
      room_type: 1,
    },
  });

export const reportAggregationPipeline = ({ content_id, page, isThread }: { content_id: string, page: number, isThread: boolean }) => [
  {
    $match: {
      content_id: content_id,
      content_type: isThread ? { $eq: "Thread" } : { $ne: "Thread" }
    }
  },
  {
    $group: {
      "_id": "$reason",
      count: {
        $sum: 1
      },
      details: {
        $push: {
          $ifNull: ["$details", "$$REMOVE"]
        }
      }
    }
  },
  {
    $project: {
      count: 1,
      content: {
        $slice: [
          "$details",
          (page - 1) * queryLimit,
          queryLimit
        ]
      }
    }
  }
]

export const reportedContentAggregation = ({ content_type, thread_id, page }: { content_type: "Post" | "Comment", thread_id: string, page: number }): PipelineStage[] => {

  const contentType = `${content_type.toLowerCase()}s`;
  const finalContentFields = content_type === "Post" ? [
    "title",
    "tag",
    "nsfw",
    "spoiler",
    "frames",
  ] : [
    "content",
    "attachment",
    "spoiler",
    "nsfw",
  ]

  return createPipeline({
    filters: [
      {
        $match: { content_type, ext_id: thread_id }
      },
      {
        $group: {
          _id: "$content_id",
          reasons: {
            $push: "$reason"
          },
          total: { $sum: 1 },
        }
      },
    ],
    page: page > 0 ? page - 1 : page,
    preProjection: [
      {
        $lookup: {
          from: contentType,
          localField: "_id",
          foreignField: "_id",
          as: "contents",
        }
      },
    ],
    sort: { total: -1 },
    projection: {
      _id: 1,
      total: 1,
      reasons: {
        $arrayToObject: {
          $map: {
            input: {
              $setUnion: [
                "$reasons",
                []
              ]
            },
            as: "r",
            in: {
              k: "$$r",
              v: {
                $size: {
                  $filter: {
                    input: "$reasons",
                    as: "reason",
                    cond: {
                      $eq: [
                        "$$reason",
                        "$$r"
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      },
      content: {
        $let: {
          vars: { temp: { $arrayElemAt: ["$contents", 0] } },
          in: finalContentFields.map(field => ({ [field]: `$$temp.${field}` }))
        }
      },
    }
  });
}