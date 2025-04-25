import { postRequest } from "@lib/helpers/common";
import { postSchemaServer } from "@lib/schemas";
import { Member, Post, Thread } from "@model";

const preCheck = async ({ user_id, data }: { user_id: string; data: any }) => {
  const isMember = await Member.exists({
    thread_id: data.thread_id,
    user_id,
  });

  if (!isMember) return { success: false, errCode: "pp208" };
  return { success: true };
};

export const POST = postRequest({
  handler: async ({ data, frames, user_id, username, session }) => {
    const post = (
      await Post.create([{ ...data, frames, user_id }], { session })
    )[0];

    await Thread.findByIdAndUpdate(
      post.thread_id,
      { $inc: { post_count: 1 } },
      { session }
    );

    return {
      result: post,
      success: true,
      available: "postCreation_pid_tid_username",
      options: { pid: post._id, tid: post.thread_id, username },
    };
  },
  schema: postSchemaServer,
  preCheck,
});
