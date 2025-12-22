import { parloculaAppURL } from "@lib/constants";
import { deletePosts } from "@lib/helpers/deletion";
import { deleteHandler, updateHandler } from "@lib/helpers/handlers";
import { postUpdateSchema } from "@lib/schemas";
import { Post, Thread, User } from "@model";
import { PostUpdateSchemaType } from "@type/schemas";

// Delete a post;
export const DELETE = deleteHandler(
  async ({ params, session, user_id }) => {
    const { id } = params;

    const posts = await deletePosts({ _id: id, user_id }, session);
    if (!posts.length) return {
      success: false, errCode: "resource_not_found"
    };

    await Thread.findByIdAndUpdate(
      posts[0].thread_id,
      { $inc: { post_count: -1 } },
      { session }
    )

    await User.findByIdAndUpdate(
      user_id,
      { $inc: { posts: -1 } },
      { session }
    );

    const { thread_id, category } = posts[0];

    return {
      success: true,
      available: "postMutation_pid_tid_uid_category",
      options: { pid: id, tid: thread_id, uid: user_id, category },
      files: [],
    };
  }
);

// Update a post;
export const PATCH = updateHandler<PostUpdateSchemaType>({
  handler: async ({ data, frames, params, session, user_id, isNsfw }) => {
    const { id } = params;

    const dataToPost = frames.length ? { ...data, frames, frames_count: frames.length } : data;

    const post = await Post.findOneAndUpdate(
      { _id: id, user_id },
      {
        $set: {
          ...dataToPost,
          edited_at: new Date(),
        },
      },
      { session, new: true }
    ).then(r => r?.toObject());

    if (!post)
      return { success: false, errCode: "resource_not_found" };

    return {
      success: true,
      available: "postUpdation_pid",
      options: { pid: id },
      result: post,
      warnTeamParlocula: post.nsfw || !isNsfw ? undefined : {
        title: "Possibly NSFW Post with incorrect flags",
        desc: "This Post may contain NSFW Frames while nsfw is set to false.",
        path: `${parloculaAppURL}/p/${post._id}`
      }
    };
  },
  schema: postUpdateSchema,
});
