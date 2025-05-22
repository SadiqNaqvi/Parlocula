import {
  deleteRequest,
  getRequest,
  postRequest,
  updateRequest,
} from "@lib/helpers/common";
import { ObjectId } from "@lib/utils";
import { Member, Thread } from "@model";

export const fetchCache = "force-cache";

// Fetch the member status of the current user in a thread.
export const GET = getRequest(
  async (_, params: { id: string; cuid: string }) => {
    const { id, cuid } = params;
    const result = await Member.findOne({
      thread_id: ObjectId(id),
      user_id: ObjectId(cuid),
    });

    return { result, success: true };
  }
);

// Joining a thread
export const POST = postRequest({
  handler: async ({ params, user_id, session, data }) => {
    const { id } = params;
    const { notification } = data;

    await Member.create([{ thread_id: id, user_id, notification }], {
      session,
    });

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
      available: "threadMembershipMutation_tid_uid",
      options: { tid: id, uid: user_id },
    };
  },
});

// Leaving a thread
export const DELETE = deleteRequest(async ({ user_id, params, session }) => {
  const { id } = params;
  await Member.findOneAndDelete({ thread_id: id, user_id }, { session });
  await Thread.findByIdAndUpdate(
    id,
    {
      $inc: { member_count: -1 },
      $max: { member_count: 0 },
    },
    { session }
  );
  return {
    success: true,
    available: "threadMembershipMutation_tid_uid",
    options: { tid: id, uid: user_id },
    files: [],
  };
});

// Enabling or disabling the notification for a thread.
export const PATCH = updateRequest({
  handler: async ({ user_id, params, session, data }) => {
    const { id } = params;

    await Member.findOneAndUpdate(
      { thread_id: id, user_id },
      { notification: data.notification ?? true },
      { session }
    );

    return {
      result: null,
      success: true,
      available: "threadMembershipMutation_tid_uid",
      options: { tid: id, uid: user_id },
      files: [],
    };
  },
});