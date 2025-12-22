import { deleteHandler, getHandler, postHandler } from "@lib/helpers/handlers";
import { sendNotification } from "@lib/helpers/server";
import { isMilestoneReached } from "@lib/utils";
import { Post, Reaction, User } from "@model";

// Get the reaction of the current user on a post.
export const GET = getHandler(
  async (_, params: { id: string; cuid: string }) => {
    const { id, cuid } = params;

    const reaction = await Reaction.findOne(
      { post_id: id, user_id: cuid },
      { reaction: 1 }
    ).exec();

    return { result: reaction?.reaction, success: true };
  }
);

// Creating a reaction on a post
export const POST = postHandler<{ reaction: string }>({
  handler: async ({ data, params, user_id, session }) => {

    const { id } = params;

    const { reaction } = data;

    const doc = await Reaction.findOneAndUpdate(
      {
        user_id,
        post_id: id,
      },
      { $set: { reaction } },
      { session, upsert: true, order: true }
    );

    if (!doc) return { success: false, errCode: "data_storing_fail" }

    else if (!doc.isModified()) {
      const post = await Post.findByIdAndUpdate(
        id,
        {
          $inc: { reaction_count: 1 },
        },
        { session, new: true, order: true }
      );
      if (!post) return { success: false, errCode: "resource_not_found" };

      await User.findByIdAndUpdate(post.user_id, { $inc: { reactions: 1 } }, { session, order: true })

      const milestoneTouched = isMilestoneReached(post.reaction_count);

      if (milestoneTouched) {
        await sendNotification(
          [
            {
              title: `Congratulations! Your post has reached ${post.reaction_count} reactions 🙌🥳`,
              path: `/post/${post._id}`,
              poster: undefined,
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
                  path: `/post/${post._id}`,
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
    }

    return {
      result: null,
      success: true,
      available: "reactionMutation_pid_uid",
      options: { pid: id, uid: user_id },
    };
  },
});

// Removing a reaction on a post.
export const DELETE = deleteHandler(async ({ params, user_id, session }) => {
  const { id } = params;

  const doc = await Reaction.findOneAndDelete(
    { post_id: id, user_id },
    { session }
  );

  if (!doc) return { success: true };

  const post = await Post.findByIdAndUpdate(
    id,
    {
      $inc: { reaction_count: -1 },
    },
    { session }
  );

  if (!post) return { success: false, errCode: "resource_not_found" };

  await User.findByIdAndUpdate(post.user_id, { $inc: { reactions: -1 } }, { session })

  return {
    success: true,
    result: null,
    available: "reactionMutation_pid_uid",
    options: { pid: id, uid: user_id },
    files: [],
  };
});
