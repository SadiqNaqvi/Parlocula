import { deleteRequest, getRequest, postRequest } from "@lib/actions/actions";
import { getCurrentUser } from "@lib/actions/serverActions";
import { ObjectId } from "@lib/utils";
import { Member, Thread } from "@model";

export const GET = getRequest(async (r, params: { id: string }) => {
  const payload = await getCurrentUser(r);

  if (!payload) return { result: null, success: false, errCode: "pp202" };

  const result = !!(await Member.exists({
    thread_id: ObjectId(params.id),
    user_id: ObjectId(payload.user_id),
  }));
  return { result, success: true, errCode: null };
});

export const POST = postRequest({
  handler: async ({ params, user_id, session, username }) => {
    const { id } = params;
    await Member.create([{ thread_id: id, user_id }], { session });
    await Thread.findByIdAndUpdate(
      id,
      {
        $inc: { member_count: 1 },
      },
      { session }
    );
    return {
      result: true,
      success: true,
      errCode: null,
      available: "joiningThread_tid_username_uid",
      options: { tid: id, username, uid: user_id },
    };
  },
});

export const DELETE = deleteRequest(
  async ({ user_id, username, params, session }) => {
    const { id } = params;
    await Member.findOneAndDelete({ thread_id: id, user_id }, { session });
    await Thread.findByIdAndUpdate(
      id,
      {
        $inc: { member_count: -1 },
      },
      { session }
    );
    return {
      success: true,
      available: "leavingThread_uid_username_tid",
      options: { tid: id, username, uid: user_id },
      files: [],
    };
  }
);
