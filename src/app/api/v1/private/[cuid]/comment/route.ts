import { postRequest } from "@lib/helpers/common";
import { commentSchema } from "@lib/schemas";
import { Comment, Member, Post } from "@model";

// Checking if the author of the post or the author of the replied comment has blocked the current user or not.
const preCheck = async ({ data, user_id }: any) => {
  const checks = await Member.aggregate([
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
export const POST = postRequest({
  handler: async ({ data, username, session, user_id }) => {
    const { post_author, comment_author, ...commentToPost } = data;
    
    const comment = (
      await Comment.create([{ ...commentToPost, user_id }], { session })
    )[0];
    
    await Post.findByIdAndUpdate(data.post_id, {
      $inc: { comment_count: 1 },
    });

    return {
      success: true,
      result: null,
      available: "commentMutation_cid_username_pid",
      options: { username, cid: comment._id, pid: data.post_id },
    };
  },
  schema: commentSchema,
  preCheck,
});
