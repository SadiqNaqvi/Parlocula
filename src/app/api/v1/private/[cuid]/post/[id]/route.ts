import { deleteRequest, updateRequest } from "@lib/helpers/common";
import { deletePosts } from "@lib/helpers/deletion";
import { postUpdateSchema } from "@lib/schemas";
import { Post } from "@model";

// Delete a post;
export const DELETE = deleteRequest(
  async ({ params, username, session, user_id }) => {
    const { id } = params;

    const posts = await deletePosts({ _id: id, user_id }, session);
    if (!posts.length) return { success: false, errCode: "resource_not_found" };

    const { thread_id, tag } = posts[0];

    return {
      success: true,
      available: "postMutation_pid_tid_username_tag",
      options: { pid: id, tid: thread_id.toString(), username, tag },
      files: [],
    };
  }
);

// Update a post;
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
      available: "postUpdation_pid",
      options: { pid: id, tid: post.thread_id, username },
      result: null,
    };
  },
  schema: postUpdateSchema,
});
