import { Comment, Follow, List, Member, Post, Thread, User } from "@model";
import { GeneralGetReturn } from "@type/internal";
import { MongooseModel } from "@type/models";
import { PipelineFunc } from "@type/other";
import { PipelineStage } from "mongoose";
import { NextRequest } from "next/server";
import { queryLimit, recentlyJoinedLimit } from "./constants";
import { getPageParams, ObjectId } from "./utils";

export const createPipeline = ({
  filters,
  page,
  projection,
  sort,
  preProjection,
}: {
  filters: PipelineStage[];
  page: number;
  sort: Record<string, number | string>;
  preProjection?: PipelineStage[];
  projection: Record<string, any>;
}): PipelineStage[] => [
    ...filters,
    {
      $facet: {
        total: [{ $count: "count" }],
        data: [
          ...(sort ? [{ $sort: sort }] : []),
          { $skip: page * queryLimit },
          { $limit: queryLimit },
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

export const postsAggregationPipeline: PipelineFunc<{
  isLinkBased?: boolean;
}> = ({ filters, sort, page = 1, isLinkBased }) =>
    createPipeline({
      filters,
      sort,
      page,
      preProjection: [
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
            from: "threads",
            localField: "thread_id",
            foreignField: "_id",
            as: "thread",
          },
        },
        {
          $addFields: {
            name: { $arrayElemAt: ["$thread.name", 0] },
            username: { $arrayElemAt: ["$user.username", 0] },
            poster: { $arrayElemAt: ["$user.profile", 0] },
            links_count: { $size: "$links" },
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

export const commentsAggregationPipelineWithReplies: PipelineFunc = ({
  filters,
  page,
  sort,
}) =>
  createPipeline({
    filters,
    page,
    sort,
    preProjection: [
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
          from: "comments",
          localField: "replied_to",
          foreignField: "_id",
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
          parent: {
            $substr: [
              { $ifNull: [{ $arrayElemAt: ["$reply.content", 0] }, ""] },
              0,
              50,
            ],
          },
        },
      },
    ],
    projection: {
      user_id: 0,
      user: 0,
      reply: 0,
    },
  });

export const commentsAggregationPipeline: PipelineFunc = ({
  filters,
  page,
  sort,
}) =>
  createPipeline({
    filters,
    sort,
    page,
    preProjection: [
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
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
    projection: {
      user_id: 0,
      user: 0,
      replied_to: 0,
      post_id: 0,
      edited_at: 0,
    },
  });

export const threadsAggregationPipeline: PipelineFunc = ({
  filters,
  page,
  sort,
}) =>
  createPipeline({
    filters,
    sort,
    page,
    projection: {
      name: 1,
      nsfw: 1,
      member_count: 1,
      post_count: 1,
      poster: 1,
    },
  });

export const listsAggregationPipeline: PipelineFunc = ({
  filters,
  page,
  sort,
}) =>
  createPipeline({
    filters,
    sort,
    page,
    projection: {
      name: 1,
      poster: 1,
      item_count: 1,
      saved_count: 1,
    },
  });

export const itemsAggregationPipeline: PipelineFunc = ({
  filters,
  page,
  sort,
}) =>
  createPipeline({
    filters,
    sort,
    page,
    preProjection: [
      {
        $lookup: {
          from: "media",
          localField: "media_id",
          foreignField: "_id",
          as: "media",
        },
      },
      {
        $addFields: {
          title: { $arrayElemAt: ["$media.title", 0] },
          media_type: { $arrayElemAt: ["$media.media_type", 0] },
          poster: {
            $ifNull: [{ $arrayElemAt: ["$media.poster", 0] }, ""],
          },
        },
      },
    ],
    projection: { media: 0 },
  });

export const usersAggregationPipeline: PipelineFunc = ({
  filters,
  page,
  sort,
}) =>
  createPipeline({
    filters,
    sort,
    page,
    projection: {
      username: 1,
      profile: 1,
      name: 1,
      followers: 1,
      posts: 1,
    },
  });

export const bookmarkAggregationPipeline: PipelineFunc<{
  type: "post" | "list" | "comment";
}> = ({ filters, page, type }) => {
  const sort = { createdAt: -1 };
  if (type === "comment")
    return commentsAggregationPipeline({ filters, page, sort });
  else if (type === "list")
    return listsAggregationPipeline({ filters, page, sort });
  else if (type === "post")
    return postsAggregationPipeline({ filters, page, sort });
  else return [];
};

export const membersAggregationPipeline: PipelineFunc = ({
  filters,
  page,
  sort,
}) =>
  createPipeline({
    filters,
    sort,
    page,
    preProjection: [
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $addFields: {
          username: { $arrayElemAt: ["$user.username", 0] },
          profile: { $arrayElemAt: ["$user.profile", 0] },
        },
      },
    ],
    projection: { user: 0, user_id: 0 },
  });

export const currentUserPipeline = (filter: any) => [
  { $match: filter },

  {
    $lookup: {
      from: "lists",
      let: { id: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$user_id", "$$id"] },
                { $eq: ["$list_type", "custom"] },
              ],
            },
          },
        },
        { $limit: queryLimit },
      ],
      as: "lists",
    },
  },

  {
    $lookup: {
      from: "lists",
      let: { id: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$user_id", "$$id"] },
                { $ne: ["$list_type", "custom"] },
              ],
            },
          },
        },
      ],
      as: "predefine_lists",
    },
  },

  {
    $lookup: {
      from: "members",
      let: { id: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$user_id", "$$id"],
            },
          },
        },
        { $limit: recentlyJoinedLimit },
      ],
      as: "members",
    },
  },

  {
    $lookup: {
      from: "threads",
      localField: "members.thread_id",
      foreignField: "_id",
      as: "threads",
    },
  },

  {
    $project: {
      initialGenres: 0,
      isActive: 0,
      lastLoginAt: 0,
      password: 0,
      session_id: 0,
      members: 0,
      lists: {
        key: 0,
        user_id: 0,
        save_count: 0,
        createdAt: 0,
        updatedAt: 0,
      },
      predefine_lists: {
        key: 0,
        user_id: 0,
        save_count: 0,
        createdAt: 0,
        updatedAt: 0,
      },
      threads: {
        connection: 0,
        created_by: 0,
        description: 0,
        links: 0,
        nsfw: 0,
        tags: 0,
        createdAt: 0,
        updatedAt: 0,
      },
    },
  },
];

export const getFollowers = async (
  user_id: string,
  limit = 50
): Promise<{ follower: string }[]> => {
  return await Follow.aggregate([
    {
      $match: {
        followee: ObjectId(user_id),
        notification: true,
      },
    },
    {
      $lookup: {
        from: "users",
        as: "user",
        localField: "follower",
        foreignField: "_id",
      },
    },
    {
      $match: {
        "user.isActive": true,
        "users.lastLoginAt": {
          $gt: new Date(Date.now() - 1000 * 3600 * 24 * 40),
        },
        "users.notification": true,
      },
    },
    { $limit: limit },
    { $project: { follower: 1 } },
  ]);
};

export const getMembers = async (
  tid: string,
  limit = 50
): Promise<{ user_id: string }[]> => {
  return await Member.aggregate([
    {
      $match: {
        thread_id: ObjectId(tid),
        notification: true,
      },
    },
    {
      $lookup: {
        from: "users",
        as: "user",
        localField: "follower",
        foreignField: "_id",
      },
    },
    {
      $match: {
        "user.isActive": true,
        "users.lastLoginAt": {
          $gt: new Date(Date.now() - 1000 * 3600 * 24 * 40),
        },
        "users.notification": true,
      },
    },
    { $limit: limit },
    { $project: { user_id: 1 } },
  ]);
};

type Collections = "users" | "posts" | "threads" | "comments" | "lists";
export const searchHandler = async ({
  collection,
  r,
  DocModel,
  filters,
}: {
  r: NextRequest;
  collection: Collections;
  DocModel?: MongooseModel;
  filters?: PipelineStage[];
}): Promise<GeneralGetReturn> => {
  const searchParams = r.nextUrl.searchParams;
  const query: string | null = searchParams.get("q");
  const nsfw: string | null = searchParams.get("nsfw");
  if (!query) return { success: false, errCode: "unknown_error" };

  const page = getPageParams(r, 0);

  const config: Record<
    Collections,
    {
      model: MongooseModel;
      filter: Record<string, boolean>;
      pipeline: PipelineFunc;
      paths: string[];
    }
  > = {
    users: {
      model: User,
      filter: { isActive: true },
      pipeline: usersAggregationPipeline,
      paths: ["username", "name"],
    },
    posts: {
      model: Post,
      filter: nsfw ? {} : { nsfw: false },
      pipeline: postsAggregationPipeline,
      paths: ["title"],
    },
    threads: {
      model: Thread,
      filter: nsfw ? {} : { nsfw: false },
      pipeline: threadsAggregationPipeline,
      paths: ["name"],
    },
    comments: {
      model: Comment,
      filter: nsfw ? {} : { nsfw: false },
      pipeline: commentsAggregationPipeline,
      paths: ["content"],
    },
    lists: {
      model: List,
      filter: { isPrivate: false },
      pipeline: listsAggregationPipeline,
      paths: ["name"],
    },
  };

  const { filter, pipeline, paths } = config[collection];
  const chosenModel = DocModel ?? config[collection].model;
  const chosenFilters = filters ?? [{ $match: filter }];

  const resp = await chosenModel.aggregate(
    pipeline({
      filters: [
        // ...chosenFilters,
        {
          $search: {
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
      ],
      page,
      sort: { score: -1 },
    })
  );

  const result = resp[0] ?? { data: [], total: 0 };
  return { success: true, result };
};

export const roomAggregationPipeline = ({
  invitation,
  page,
  cuid,
}: {
  invitation: boolean;
  page: number;
  cuid: string;
}) =>
  createPipeline({
    filters: [
      {
        $match: {
          user_id: ObjectId(cuid),
          type: invitation ? { $eq: "invitee" } : { $ne: "invitee" },
        },
      },
      {
        $lookup: {
          from: "rooms",
          let: { hideAt: "$hideAt", room_id: "$room_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$room_id"] },
                    {
                      $gt: ["$lastMessageAt", "$$hideAt"],
                    },
                  ],
                },
              },
            },
          ],
          as: "room",
        },
      },
      { $match: { "room.0": { $exists: true } } },
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
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$isGroup", false] },
                    { $eq: ["$room_id", "$$room_id"] },
                    { $ne: ["$user_id", ObjectId(cuid)] },
                  ],
                },
              },
            },
            { $limit: 1 },
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
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$$isGroup", false] },
                    { $eq: ["$_id", "$$uid"] },
                  ],
                },
              },
            },
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

export const reportAggregationPipeline = ({
  content_id,
  page,
  isThread
}: {
  content_id: string,
  page: number,
  isThread: boolean,
}) => {

  return [
    {
      $match: {
        content_id: ObjectId(content_id),
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

}

export const reportedContentAggregation = ({
  content_type, thread_id, page
}: {
  content_type: "Post" | "Comment", thread_id: string, page: number
}): PipelineStage[] => {

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
        $match: {
          content_type,
          ext_id: ObjectId(thread_id)
        }
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

// In the above pipleine, add a lookup stage which fetches the content based on content_type and then projects only the important fields.