import { postRequest } from "@lib/helpers/common";
import { postSchemaServer } from "@lib/schemas";
import { ObjectId } from "@lib/utils";
import { Post, Thread, User } from "@model";
import { PostSchemaType } from "@type/schemas";
import { PipelineStage } from "mongoose";

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
    return { success: false, errCode: "pp205" };

  const pipeline = [
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
                ],
              },
            },
          },
        ],
      },
    },
    repost_author && {
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
                  { $eq: ["$followee", ObjectId(repost_author)] },
                ],
              },
            },
          },
        ],
      },
    },
  ].filter(Boolean) as PipelineStage[];

  const checks = await User.aggregate(pipeline);

  const check = checks[0];

  if (!check.isMember || !check.isMember.length)
    return { success: false, errCode: "pp208" };
  else if (repost_id && !check.isBlocked.length)
    return { success: false, errCode: "pp207" };
  return { success: true };
};

// Posting in a thread.
export const POST = postRequest({
  handler: async ({ data, frames, user_id, username, session }) => {
    const { repost_author, ...rest } = data as PostSchemaType;
    const post = (
      await Post.create([{ ...rest, frames, user_id }], { session })
    )[0];

    await Thread.findByIdAndUpdate(
      post.thread_id,
      { $inc: { post_count: 1 } },
      { session }
    );

    await User.findByIdAndUpdate(user_id, { $inc: { posts: 1 } }, { session });

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
