import { deleteRequest, getRequest, postRequest } from "@lib/helpers/common";
import { ObjectId } from "@lib/utils";
import { Member, Thread } from "@model";

// Fetch the member status of the current user in a thread.
export const GET = getRequest(
  async (_, params: { id: string; cuid: string }) => {
    const { id, cuid } = params;
    const result = await Member.exists({
      thread_id: ObjectId(id),
      user_id: ObjectId(cuid),
    });

    if (!result) return { success: false, errCode: "pp104" };
    return { result: Boolean(result), success: true };
  }
);

// Joining a thread
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

// Leaving a thread
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
