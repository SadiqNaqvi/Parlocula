import { deleteRequest, getRequest, postRequest } from "@lib/helpers/common";
import { sendNotification } from "@lib/helpers/server";
import { voteSchema } from "@lib/schemas";
import { isMilestoneReached, ObjectId } from "@lib/utils";
import { Comment, Follow, Vote } from "@model";
import { FullComment } from "@type/internal";
import { VoteModelType } from "@type/models";
import { VoteSchemaType } from "@type/schemas";

// Checking if the current user has been blocked by the author of the comment.
const preCheck = async ({ user_id, data }: { user_id: string; data: any }) => {
  const { comment_author } = data;

  const isBlocked = await Follow.exists({
    follower: ObjectId(user_id),
    followee: ObjectId(comment_author),
    blocked: true,
  });

  if (isBlocked) return { success: false, errCode: "blocked_by_author" };

  return { success: true };
};

// Creating a vote on a comment
export const POST = postRequest<VoteSchemaType>({
  handler: async ({ data, user_id, params, session }) => {
    const { id } = params;
    const { type } = data;

    await Vote.create([{ type, user_id, comment_id: id } as VoteModelType], {
      session,
    });

    const comment = await Comment.findByIdAndUpdate<FullComment>(
      id,
      {
        $inc: { upvote_count: type === "up" ? 1 : -1 },
      },
      { session, new: true }
    );

    if (!comment) return { success: false, errCode: "resource_not_found" };
    const milestoneTouched = isMilestoneReached(comment.upvote_count);

    if (milestoneTouched) {
      await sendNotification(
        [
          {
            title: `Congratulations! Your comment has got ${comment.upvote_count} upvotes 🙌🥳`,
            message: [
              {
                type: "link",
                label: "Your comment",
                path: `/c/${comment._id}`,
              },
              {
                type: "text",
                text: `has reached a new milestone. It got ${comment.upvote_count} upvotes 🙌🥳`,
              },
            ],
            path: `/c/${comment._id}`,
            user_id: comment.user_id,
          },
        ],
        session
      );
    }

    return {
      result: true,
      success: true,
      available: "voteMutation_cid_uid_author",
      options: {
        cid: id,
        uid: user_id,
        author: milestoneTouched ? comment.user_id : "",
      },
    };
  },
  schema: voteSchema,
  preCheck,
});

// Check if the current user has voted a comment or not
export const GET = getRequest(
  async (_, params: { id: string; cuid: string }) => {
    const { id, cuid } = params;

    const vote = await Vote.findOne(
      {
        comment_id: ObjectId(id),
        user_id: ObjectId(cuid),
      },
      { type: 1 }
    );

    return { result: vote?.type, success: true };
  }
);

// Delete the vote of the current user on a comment
export const DELETE = deleteRequest(async ({ user_id, params, session }) => {
  const { id } = params;

  const doc = await Vote.findOneAndDelete(
    {
      comment_id: ObjectId(id),
      user_id: ObjectId(user_id),
    },
    { session }
  );

  if (!doc) return { success: true };

  await Comment.findByIdAndUpdate(
    id,
    {
      $inc: { upvote_count: -1 },
    },
    { session }
  );
  return {
    success: true,
    result: null,
    available: "voteMutation_cid_uid_author",
    options: { cid: id, uid: user_id, author: "" },
    files: [],
  };
});
