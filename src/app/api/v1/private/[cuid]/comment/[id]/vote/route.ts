import { deleteRequest, getRequest, postRequest } from "@lib/helpers/common";
import { voteSchema } from "@lib/schemas";
import { ObjectId } from "@lib/utils";
import { Comment, Follow, Vote } from "@model";

// Checking if the current user has been blocked by the author of the comment.
const preCheck = async ({ user_id, data }: { user_id: string; data: any }) => {
  const { comment_author } = data;

  const isBlocked = await Follow.exists({
    follower: ObjectId(user_id),
    followee: ObjectId(comment_author),
    blocked: true,
  });

  if (isBlocked) return { success: false, errCode: "pp207" };

  return { success: true };
};

// Creating a vote on a comment
export const POST = postRequest({
  handler: async ({ data, user_id, params, session }) => {
    const { id } = params;
    const { type } = data;

    await Vote.create({ type, user_id, comment_id: id }, { session });
    await Comment.findByIdAndUpdate(
      id,
      {
        $inc: { upvote_count: type === "up" ? 1 : -1 },
      },
      { session }
    );

    return {
      result: true,
      success: true,
      available: "voteCreation_cid_uid",
      options: { cid: id, uid: user_id },
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
    if (!vote) return { success: false, errCode: "pp104" };
    return { result: vote.type, success: true };
  }
);

// Delete the vote of the current user on a comment
export const DELETE = deleteRequest(async ({ user_id, params, session }) => {
  const { id } = params;
  await Vote.findOneAndDelete(
    {
      comment_id: ObjectId(id),
      user_id: ObjectId(user_id),
    },
    { session }
  );
  await Comment.findByIdAndUpdate(
    id,
    {
      $inc: { upvote_count: -1 },
    },
    { session }
  );

  return {
    success: true,
    errCode: null,
    available: "voteDeletion_cid_uid",
    options: { cid: id, uid: user_id },
    files: [],
  };
});
