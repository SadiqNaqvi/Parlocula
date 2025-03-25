import { deleteRequest, updateRequest } from "@lib/actions/actions";
import { postUpdateSchema } from "@lib/schemas";
import { Comment, Post } from "@model";

export const DELETE = deleteRequest(
  async ({ params, username, session, user_id }) => {
    const { id } = params;

    const post = await Post.findOneAndDelete({ _id: id, user_id }, { session });
    if (!post) return { success: false, errCode: "pp500" };

    const { frames, thread_id } = post;
    await Comment.deleteMany({ post_id: id }, { session });

    return {
      success: true,
      available: "postDeletion_pid_tid_username",
      options: { pid: id, tid: thread_id.toString(), username },
      files: frames,
    };
  }
);

export const PATCH = updateRequest({
  handler: async ({ data, frames, params, session, username, user_id }) => {
    const { id } = params;
    if (frames.length) data.frames = frames;

    const post = await Post.findOneAndUpdate(
      { _id: id, user_id },
      {
        $set: { ...data, edited_at: new Date() },
      },
      { session }
    );

    if (!post) return { success: false, errCode: "pp500" };

    return {
      success: true,
      available: "postCreation_pid_tid_username",
      options: { pid: id, tid: post.thread_id, username },
      result: null,
    };
  },
  schema: postUpdateSchema,
});
