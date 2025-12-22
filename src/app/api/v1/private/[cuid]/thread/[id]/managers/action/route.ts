import { deleteHandler, updateHandler } from "@lib/helpers/handlers";
import { Member } from "@model";

// Invitee accepts manager invitation
export const PATCH = updateHandler({
  handler: async ({ user_id, params, session }) => {
    const { id } = params;

    await Member.findOneAndUpdate(
      { thread_id: id, user_id, role: "invitee" },
      { $set: { role: "moderator" } },
      { session }
    );

    return {
      success: true,
      result: null,
      available: "threadManagersMutation_tid_uid",
      options: { tid: id, uid: user_id },
    };
  }
});

// Invitee rejects manager invitation
export const DELETE = deleteHandler(async ({ user_id, params, session }) => {

  const { id } = params;

  await Member.findOneAndUpdate(
    { thread_id: id, user_id, role: "invitee" },
    { $set: { role: "member" } },
    { session }
  );

  return {
    success: true,
    result: null,
    available: "threadManagersMutation_tid_uid",
    options: { tid: id, uid: user_id },
  };
});
