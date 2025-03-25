import { getRequest, deleteRequest, postRequest } from "@lib/actions/actions";
import { getCurrentUser } from "@lib/actions/serverActions";
import { connectPPDB } from "@lib/database";
import { ObjectId } from "@lib/utils";
import { Comment, Vote } from "@model";
import { z } from "zod";

const schema = z.object({
  type: z.enum(["up", "down"]),
});

const preCheck = async ({
  params,
  user_id,
}: {
  params: { id: string };
  user_id: string;
}) => {
  const { id } = params;
  try {
    const isDbConnected = await connectPPDB();
    if (!isDbConnected) return { success: false, errCode: "pp101" };

    const comment = (
      await Comment.aggregate([
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

    if (!comment || !comment.user.length)
      return {
        success: false,
        errCode: comment ? "pp202" : "pp204",
      };
    return { success: true, errCode: null };
  } catch (err: any) {
    console.error("Error occured in precheck at private/");
    return { success: false, errCode: "pp100" };
  }
};

export const POST = postRequest({
  handler: async ({ data, user_id, params, session }) => {
    const { id } = params;
    const { type } = data;

    await Vote.create({ type, user_id, comment_id: id }, { session });
    await Comment.findByIdAndUpdate(
      id,
      {
        $inc: { upvote_count: 1 },
      },
      { session }
    );

    return {
      result: true,
      success: true,
      errCode: null,
      available: "voteCreation_cid_uid",
      options: { cid: id, uid: user_id },
    };
  },
  schema,
  preCheck,
});

export const GET = getRequest(async (r: any, params: { id: string }) => {
  const { id } = params;
  const payload = await getCurrentUser(r);
  if (!payload) return { result: null, success: false, errCode: "pp202" };
  const vote = await Vote.findOne(
    {
      comment_id: ObjectId(id),
      user_id: ObjectId(payload.user_id),
    },
    { type: 1 }
  );
  return { result: vote?.type, success: true, errCode: null };
});

export const DELETE = deleteRequest(async ({ user_id, params, session }) => {
  const { id } = params;
  await Comment.findOneAndDelete(
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
