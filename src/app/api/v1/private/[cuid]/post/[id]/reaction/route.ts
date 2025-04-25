import { deleteRequest, getRequest, postRequest } from "@lib/helpers/common";
import { ObjectId } from "@lib/utils";
import { Post, Reaction } from "@model";

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

    if (!reaction) return { success: false, errCode: "pp104" };
    return { result: reaction.reaction, success: true };
  }
);

// Creating a reaction on a post
export const POST = postRequest({
  handler: async ({ data, params, user_id, session }) => {
    const { id } = params;
    const { reaction } = data;
    await Reaction.create(
      {
        reaction,
        user_id: ObjectId(user_id),
        post_id: ObjectId(id),
      },
      { session }
    );
    await Post.findByIdAndUpdate(
      id,
      {
        $inc: { reaction_count: 1 },
      },
      { session }
    );
    return {
      result: true,
      success: true,
      errCode: null,
      available: "reactionCreation_pid_uid",
      options: { pid: id, uid: user_id },
    };
  },
});

// Removing a reaction on a post.
export const DELETE = deleteRequest(async ({ params, user_id, session }) => {
  const { id } = params;
  await Reaction.findOneAndDelete(
    {
      post_id: ObjectId(id),
      user_id,
    },
    { session }
  );
  await Post.findByIdAndUpdate(
    id,
    {
      $inc: { reaction_count: -1 },
    },
    { session }
  );
  return {
    success: true,
    errCode: null,
    available: "reactionDeletion_pid_uid",
    options: { pid: id, uid: user_id },
    files: [],
  };
});
