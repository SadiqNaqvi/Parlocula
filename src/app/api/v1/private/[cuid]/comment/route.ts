import { postRequest } from "@lib/helpers/common";
import { sendNotification } from "@lib/helpers/server";
import { commentSchema } from "@lib/schemas";
import { createArray } from "@lib/utils";
import { Comment, Follow, Notifications, Post } from "@model";
import { CommentModelType, NotificationModelType } from "@type/models";
import { CommentSchemaType } from "@type/schemas";
import Ably from "ably";

// Checking if the author of the post or the author of the replied comment has blocked the current user or not.
const preCheck = async ({ data, user_id }: any) => {
  const checks = await Follow.aggregate([
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

  const isBlocked = Boolean(
    checks[0].authorOfPost.length || checks[0].authorOfRepliedComment.length
  );

  if (isBlocked) return { success: false, errCode: "pp500" };

  return { success: true };
};

// Posting a comment
export const POST = postRequest<CommentSchemaType>({
  handler: async ({ data, username, session, user_id }) => {
    const { post_author, comment_author, ...rest } = data;

    const commentToPost: CommentModelType = { ...rest, user_id };

    const comment = (await Comment.create([commentToPost], { session }))[0];

    const post = await Post.findByIdAndUpdate(
      data.post_id,
      {
        $inc: { comment_count: 1 },
      },
      { session }
    );

    if (!post) return { success: false, errCode: "resource_not_found" };

    const notifications = createArray<NotificationModelType>({
      message: [
        { type: "link", label: username, path: `/u/${username}` },
        { type: "text", text: "commented on your post" },
        {
          type: "link",
          label: `${post.title.slice(0, 10).concat(post.title.length > 10 ? "..." : ".")}`,
          path: `/p/${rest.post_id}?f=latest`,
        },
        {
          type: "link",
          label: "Open Comment.",
          path: `/c/${comment._id}`,
        },
      ],
      title: `${username} commented on your post.`,
      path: `/p/${rest.post_id}?f=latest`,
      user_id: post_author,
      metadata: {
        post_id: rest.post_id,
        comment_id: comment._id,
      },
    }).concatConditionally(comment_author, (user_id) => ({
      message: [
        { type: "link", label: username, path: `/u/${username}` },
        { type: "text", text: "replied to your" },
        {
          type: "link",
          label: "comment.",
          path: `/c/${rest.replied_to}?f=latest`,
        },
      ],
      user_id,
      title: `${username} replied to your comment.`,
      path: `/c/${rest.replied_to}?f=latest`,
      metadata: {
        post_id: rest.post_id,
        comment_id: comment._id,
      },
    }));

    await sendNotification(notifications, session);

    return {
      success: true,
      result: null,
      revalidateQueue: createArray([
        `filter-latest-comments-user-${username}-page-1`,
        `comments-post-${data.post_id}-filter-latest-page-1`,
        `notifications-user-${post_author}`,
      ]).concatConditionally(comment_author, (uid) => [
        `replies-comment-${comment.replied_to}-filter-latest-page-1`,
        `notifications-user-${uid}`,
      ]),
    };
  },
  schema: commentSchema,
  preCheck,
});
