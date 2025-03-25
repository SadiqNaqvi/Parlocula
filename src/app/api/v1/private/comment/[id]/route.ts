import { deleteRequest, updateRequest } from "@lib/actions/actions";
import { commentSchemaUpdate } from "@lib/schemas";
import { Comment, Post } from "@model";

export const DELETE = deleteRequest(
  async ({ params, session, user_id, username }) => {
    const { id } = params;

    const commentToDelete = await Comment.findOne(
      { _id: id, user_id },
      { post_id: 1 },
      { session }
    );

    if (!commentToDelete) return { success: false, errCode: "pp500" };

    await Comment.findOneAndDelete({ _id: id, user_id }, { session });
    await Post.findByIdAndUpdate(
      commentToDelete.post_id,
      {
        $inc: { comment_count: -1 },
      },
      { session }
    );

    return {
      success: true,
      files: [],
      available: "commentDeletion_cid_username_pid",
      options: { cid: id, pid: commentToDelete.post_id, username },
    };
  }
);

export const PATCH = updateRequest({
  handler: async ({ data, params, session, user_id, username }) => {
    const { id } = params;

    const comment = await Comment.findOneAndUpdate(
      { _id: id, user_id },
      { $set: { ...data, edited_at: new Date() } },
      { session }
    );

    if (!comment) return { success: false, errCode: "pp500" };

    return {
      success: true,
      result: null,
      available: "commentCreation_cid_username_pid",
      options: { cid: id, username, pid: comment.post_id },
    };
  },
  schema: commentSchemaUpdate,
});
