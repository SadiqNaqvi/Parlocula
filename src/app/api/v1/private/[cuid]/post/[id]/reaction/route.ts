import { deleteRequest, getRequest, postRequest } from "@lib/helpers/common";
import { sendNotification } from "@lib/helpers/server";
import { isMilestoneReached, ObjectId } from "@lib/utils";
import { Notifications, Post, Reaction } from "@model";
import { FullPost } from "@type/internal";
import { NotificationModelType } from "@type/models";
import Ably from "ably";

// Get the reaction of the current user on a post.
export const GET = getRequest(
  async (_, params: { id: string; cuid: string }) => {
    const { id, cuid } = params;

    const reaction = await Reaction.findOne(
      {
        post_id: ObjectId(id),
        user_id: ObjectId(cuid),
      },
      { reaction: 1 }
    );

    return { result: reaction?.reaction, success: true };
  }
);

// Creating a reaction on a post
export const POST = postRequest({
  handler: async ({ data, params, user_id, session }) => {
    const { id } = params;
    const { reaction } = data;
    await Reaction.create(
      [
        {
          reaction,
          user_id: ObjectId(user_id),
          post_id: ObjectId(id),
        },
      ],
      { session }
    );

    const post = await Post.findByIdAndUpdate<FullPost>(
      id,
      {
        $inc: { reaction_count: 1 },
      },
      { session, new: true }
    );

    if (!post) return { success: false, errCode: "resource_not_found" };
    const milestoneTouched = isMilestoneReached(post.reaction_count);

    if (milestoneTouched) {
      await sendNotification(
        [
          {
            title: `Congratulations! Your post has reached ${post.reaction_count} reactions 🙌🥳`,
            path: `/p/${post._id}`,
            message: [
              {
                type: "text",
                text: "Congratulations! Your post",
              },
              {
                type: "link",
                label: post.title
                  .slice(0, 50)
                  .concat(post.title.length > 50 ? "..." : ""),
                path: `/p/${post._id}`,
              },
              {
                type: "text",
                text: `has reached a new milestone. It got ${post.reaction_count} reactions 🙌🥳.`,
              },
            ],
            user_id: post.user_id,
          },
        ],
        session
      );
    }

    return {
      result: true,
      success: true,
      available: "reactionMutation_pid_uid",
      options: { pid: id, uid: user_id },
    };
  },
});

// Removing a reaction on a post.
export const DELETE = deleteRequest(async ({ params, user_id, session }) => {
  const { id } = params;
  const doc = await Reaction.findOneAndDelete(
    {
      post_id: ObjectId(id),
      user_id,
    },
    { session }
  );

  if (!doc) return { success: true };

  await Post.findByIdAndUpdate(
    id,
    {
      $inc: { reaction_count: -1 },
    },
    { session }
  );

  return {
    success: true,
    result: null,
    available: "reactionMutation_pid_uid",
    options: { pid: id, uid: user_id },
    files: [],
  };
});
