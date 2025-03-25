import { postRequest, deleteRequest, getRequest } from "@lib/actions/actions";
import { getCurrentUser } from "@lib/actions/serverActions";
import { connectPPDB } from "@lib/database";
import { ObjectId } from "@lib/utils";
import { Post, Reaction } from "@model";
import { ReactionModelType } from "@type/modelTypes";

export const cache = "force-cache";

export const GET = getRequest(async (r: any, params: { id: string }) => {
  const { id } = params;
  const payload = await getCurrentUser(r);
  if (!payload) return { result: null, success: false, errCode: "pp202" };
  const reaction = await Reaction.findOne<ReactionModelType>(
    {
      post_id: ObjectId(id),
      user_id: ObjectId(payload.user_id),
    },
    { reaction: 1 }
  );
  return { result: reaction?.reaction, success: true, errCode: null };
});

const preCheck = async ({
  params,
  user_id,
}: {
  params: { id: string };
  user_id?: string;
}) => {
  const { id } = params;
  try {
    const isDbConnected = await connectPPDB();
    if (!isDbConnected) return { success: false, errCode: "pp101" };

    const post = (
      await Post.aggregate([
        { $match: { _id: ObjectId(id) } },
        { $addFields: { currentUid: user_id } },
        {
          $lookup: {
            from: "users",
            localField: "currentUid",
            foreignField: "_id",
            as: "user",
          },
        },
      ])
    )[0];

    if (!post || !post.user.length)
      return {
        success: false,
        errCode: post ? "pp202" : "pp204",
      };
    return { success: true, errCode: null };
  } catch (err: any) {
    console.error("Error occured in precheck at private/");
    return { success: false, errCode: "pp100" };
  }
};

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
  preCheck,
});

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
