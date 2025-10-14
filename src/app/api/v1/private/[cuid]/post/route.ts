import { postRequest } from "@lib/helpers/common";
import { sendNotification } from "@lib/helpers/server";
import { getFollowers, getMembers } from "@lib/pipelines";
import { postSchemaServer } from "@lib/schemas";
import { createArray, ObjectId } from "@lib/utils";
import { Notifications, Post, Thread, User } from "@model";
import { NotificationModelType, ThreadModelType } from "@type/models";
import { PostSchemaType } from "@type/schemas";
import Ably from "ably";

// Checking if the current user is a member of the thread and if user is blocked by the author of the repost.
const preCheck = async ({
  user_id,
  data,
}: {
  user_id: string;
  data: PostSchemaType;
}) => {
  const { thread_id, repost_id, repost_author } = data;

  if (!thread_id || (repost_id && !repost_author))
    return { success: false, errCode: "invalid_input" };

  const pipeline = createArray([
    { $match: { _id: ObjectId(user_id) } },
    {
      $lookup: {
        from: "members",
        as: "isMember",
        let: { id: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$user_id", "$$id"] },
                  { $eq: ["$thread_id", ObjectId(thread_id)] },
                  { $eq: ["$banned", false] },
                ],
              },
            },
          },
        ],
      },
    },
  ]).concatConditionally(repost_author, (author) => ({
    $lookup: {
      from: "follows",
      as: "isBlocked",
      let: { id: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$follower", "$$id"] },
                { $eq: ["$followee", ObjectId(author)] },
              ],
            },
          },
        },
      ],
    },
  }));

  const checks = await User.aggregate(pipeline);

  const check = checks[0];

  if (!check.isMember || !check.isMember.length)
    return { success: false, errCode: "not_a_member" };
  else if (repost_id && !check.isBlocked.length)
    return { success: false, errCode: "blocked_by_author" };
  return { success: true };
};

// Posting in a thread.
export const POST = postRequest({
  handler: async ({ data, frames, user_id, username, session }) => {
    const { repost_author, ...rest } = data as PostSchemaType;
    const post = (
      await Post.create([{ ...rest, frames, user_id }], { session })
    )[0];

    const thread = await Thread.findByIdAndUpdate<ThreadModelType>(
      post.thread_id,
      { $inc: { post_count: 1 } },
      { session }
    );

    if (!thread) return { success: false, errCode: "resource_not_found" };

    await User.findByIdAndUpdate(user_id, { $inc: { posts: 1 } }, { session });

    const followers = await getFollowers(user_id, 50);
    const members = await getMembers(post.thread_id, 100);

    await sendNotification(
      Array.from(
        new Set(
          followers
            .map(({ follower }) => follower)
            .concat(members.map(({ user_id }) => user_id))
        )
      ).map((u) => ({
        title: `${username} has created a new post in ${thread.name}`,
        path: `/p/${post._id}`,
        message: [
          { type: "link", label: username, path: `/u/${username}` },
          { type: "text", text: "has created a new post in thread" },
          {
            type: "link",
            label: `${thread.name}.`,
            path: `/t/${post.thread_id}`,
          },
          { type: "text", text: "Be the first one to" },
          {
            type: "link",
            label: "check it out.",
            path: `/p/${post._id}`,
          },
        ],
        user_id: u,
      })),
      session
    );

    return {
      result: post,
      success: true,
      available: "postMutation_pid_tid_username_tag",
      options: { pid: post._id, tid: post.thread_id, tag: data.tag, username },
    };
  },
  schema: postSchemaServer,
  preCheck,
});
