import { PipelineFunc } from "@type/other";
import { queryLimit, recentlyJoinedLimit } from "./constants";

export const postsAggregationPipeline: PipelineFunc = ({
  filters,
  sort,
  page = 1,
}) => [
  ...filters,
  {
    $facet: {
      total: [{ $count: "count" }],
      data: [
        sort && { $sort: sort },
        { $skip: page * queryLimit },
        { $limit: queryLimit },
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
          },
        },
        {
          $project: {
            user: 0,
            thread: 0,
            user_id: 0,
            body: 0,
            links: 0,
          },
        },
      ].filter(Boolean),
    },
  },
  {
    $project: {
      total: { $arrayElemAt: ["$total.count", 0] },
      data: 1,
    },
  },
];

export const commentsAggregationPipelineWithReplies: PipelineFunc = ({
  filters,
  page,
  sort,
}) => [
  ...filters,
  {
    $facet: {
      total: [{ $count: "count" }],
      data: [
        sort && { $sort: sort },
        { $skip: page * queryLimit },
        { $limit: queryLimit },
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
          $unwind: {
            path: "$reply",
            preserveNullAndEmptyArrays: true,
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
              $substr: [{ $ifNull: ["$reply.content", ""] }, 0, 50],
            },
          },
        },
        {
          $project: {
            user_id: 0,
            user: 0,
            reply: 0,
          },
        },
      ].filter(Boolean),
    },
  },
  {
    $project: {
      total: { $arrayElemAt: ["$total.count", 0] },
      data: 1,
    },
  },
];

export const commentsAggregationPipeline: PipelineFunc = ({
  filters,
  page,
  sort,
}) => [
  ...filters,
  {
    $facet: {
      total: [{ $count: "count" }],
      data: [
        sort && { $sort: sort },
        { $skip: page * queryLimit },
        { $limit: queryLimit },
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
        {
          $project: {
            user_id: 0,
            user: 0,
            replied_to: 0,
            post_id: 0,
            edited_at: 0,
          },
        },
      ].filter(Boolean),
    },
  },
  {
    $project: {
      total: { $arrayElemAt: ["$total.count", 0] },
      data: 1,
    },
  },
];

export const threadsAggregationPipeline: PipelineFunc = ({
  filters,
  page,
  sort,
}) => [
  ...filters,
  {
    $facet: {
      total: [{ $count: "total" }],
      data: [
        sort && { $sort: sort },
        { $skip: page * queryLimit },
        { $limit: queryLimit },
        {
          $project: {
            name: 1,
            nsfw: 1,
            member_count: 1,
            post_count: 1,
            poster: 1,
          },
        },
      ].filter(Boolean),
    },
  },
  {
    $project: {
      data: 1,
      total: { $arrayElemAt: ["$total.total", 0] },
    },
  },
];

export const listsAggregationPipeline: PipelineFunc = ({
  filters,
  page,
  sort,
}) => [
  ...filters,
  {
    $facet: {
      total: [{ $count: "total" }],
      data: [
        sort && { $sort: sort },
        { $skip: page * queryLimit },
        { $limit: queryLimit },
        {
          $project: {
            name: 1,
            poster: 1,
            item_count: 1,
            saved_count: 1,
          },
        },
      ].filter(Boolean),
    },
  },
  {
    $project: {
      data: 1,
      total: { $arrayElemAt: ["$total.total", 0] },
    },
  },
];

export const usersAggregationPipeline: PipelineFunc = ({
  filters,
  page,
  sort,
}) => [
  ...filters,
  {
    $facet: {
      total: [{ $count: "total" }],
      data: [
        sort && { $sort: sort },
        { $skip: page * queryLimit },
        { $limit: queryLimit },
        {
          $project: {
            username: 1,
            profile: 1,
          },
        },
      ].filter(Boolean),
    },
  },
  {
    $project: {
      data: 1,
      total: { $arrayElemAt: ["$total.total", 0] },
    },
  },
];

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
      genres: 0,
      password: 0,
      session_id: 0,
      members: 0,
      lists: {
        key: 0,
        user_id: 0,
        save_count: 0,
        createdAt: 0,
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
