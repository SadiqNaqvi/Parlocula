import { deleteRequest, updateRequest } from "@lib/helpers/common";
import { deleteComments } from "@lib/helpers/deletion";
import { commentSchemaUpdate } from "@lib/schemas";
import { Comment, Post } from "@model";
import { CommentSchemaUpdateType } from "@type/schemas";

// Delete A Comment
export const DELETE = deleteRequest(
  async ({ params, session, user_id, username }) => {
    const { id } = params;

    const result = await deleteComments({ _id: id, user_id }, session);
    const commentToDelete = result[0];

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
      available: "commentMutation_cid_username_pid",
      options: { cid: id, pid: commentToDelete.post_id, username },
    };
  }
);

// Update a comment
export const PATCH = updateRequest<CommentSchemaUpdateType>({
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
      available: "commentUpdation_cid",
      options: { cid: id, username, pid: comment.post_id.toString() },
    };
  },
  schema: commentSchemaUpdate,
});
