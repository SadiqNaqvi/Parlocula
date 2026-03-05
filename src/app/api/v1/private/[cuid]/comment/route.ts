import { postHandler, PrecheckFunction } from "@lib/helpers/handlers";
import { sendNotification } from "@lib/helpers/server";
import { commentSchema } from "@lib/schemas";
import { createArray } from "@lib/utils";
import { Comment, Connection, Post, Thread, User } from "@model";
import { CommentModelType, NotificationModelType } from "@type/models";
import { CommentSchemaType } from "@type/schemas";

// Checking if the author of the post or the author of the replied comment has blocked the current user or not.

const preCheck: PrecheckFunction<CommentSchemaType> = async ({ data, user_id }) => {

  const checks = await Connection.aggregate([
    {
      $facet: {
        authorOfPost: [
          {
            $match: {
              followee: data.post_author,
              follower: user_id,
              blocked: true,
            },
          },
          { $project: { _id: 1 } },
        ],
        ...(data.comment_author && {
          authorOfRepliedComment: [
            {
              $match: {
                followee: data.comment_author,
                follower: user_id,
                blocked: true,
              },
            },
            { $project: { _id: 1 } },
          ],
        }),
      },
    },
  ]);

  const isBlocked = Boolean(checks[0].authorOfPost[0] || checks[0].authorOfRepliedComment[0]);

  if (isBlocked)
    return { success: false, errCode: "blocked_by_author" };

  return { success: true };
}

// Posting a comment
export const POST = postHandler<CommentSchemaType>({
  handler: async ({ data, username, session, user_id, profile }) => {
    const { post_author, comment_author, ...rest } = data;

    const comment = (await Comment.create([{ ...rest, user_id }], { session }))[0];

    const post = await Post.findByIdAndUpdate(
      data.post_id,
      {
        $inc: { comment_count: 1 },
      },
      { session }
    );

    if (!post)
      return { success: false, errCode: "resource_not_found" };

    await Thread.findByIdAndUpdate(
      post.thread_id,
      {
        $set: { lastCommentedAt: new Date() },
        $inc: { comment_count: 1 }
      },
      { session }
    );

    await User.findByIdAndUpdate(user_id, {
      $set: { lastCommentedAt: new Date() },
      $inc: { comments: 1 }
    }, { session });

    if (rest.replied_to) {
      await Comment.findByIdAndUpdate(rest.replied_to, { $inc: { replies_count: 1 } }, { session })
    }

    await Promise.all(
      createArray(
        sendNotification([post_author], {
          message: [
            { type: "link", label: username, path: `/user/${username}` },
            { type: "text", text: "commented on your post" },
            {
              type: "link",
              label: `${post.title.slice(0, 10).concat(post.title.length > 10 ? "..." : ".")}`,
              path: `/post/${rest.post_id}?f=latest`,
            },
            {
              type: "link",
              label: "Open Comment.",
              path: `/comment/${comment._id}`,
            },
          ],
          title: `${username} commented on your post.`,
          poster: profile,
          path: `/post/${rest.post_id}?f=latest`,
          metadata: {
            post_id: rest.post_id,
            comment_id: comment._id,
          },
        }, session)
      ).concatConditionally(comment_author, (author) =>
        sendNotification([author], {
          message: [
            { type: "link", label: username, path: `/user/${username}` },
            { type: "text", text: "replied to your" },
            {
              type: "link",
              label: "comment.",
              path: `/comment/${rest.replied_to}?f=latest`,
            },
          ],
          title: `${username} replied to your comment.`,
          poster: profile,
          path: `/comment/${rest.replied_to}?f=latest`,
          metadata: {
            post_id: rest.post_id,
            comment_id: comment._id,
          },
        }, session)
      ))

    return {
      success: true,
      result: null,
      revalidateQueue: createArray([
        `comments-user-${username}`,
        `comments-post-${data.post_id}`,
        `notifications-user-${post_author}`,
      ]).concatConditionally(comment_author, (uid) => [
        `notifications-user-${uid}`,
      ]).concatConditionally(comment.replied_to, (parent) => [
        `replies-comment-${parent}`
      ])
    };
  },
  schema: commentSchema,
  preCheck
});