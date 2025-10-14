import { deleteRequest, updateRequest } from "@lib/helpers/common";
import { ObjectId } from "@lib/utils";
import { Member, Thread } from "@model";

// Making sure the current user is a member as well as in the invitees array of the thread.
const precheck = async (tid: string, uid: string) => {
  const response = await Member.aggregate([
    { $match: { thread_id: ObjectId(tid), user_id: ObjectId(uid) } },
    {
      $lookup: {
        from: "threads",
        localField: "thread_id",
        foreignField: "_id",
        as: "thread",
      },
    },
    {
      $addFields: {
        invitees: {
          $ifNull: [
            {
              $arrayElemAt: ["$thread.invitees", 0],
            },
            [],
          ],
        },
      },
    },
    {
      $project: {
        invitees: 1,
      },
    },
  ]);

  const member: { invitees: string[] } | null = response[0];
  if (!member) return { success: false, errCode: "unauthorized_access" };

  if (!member.invitees.find((i: string) => i === uid))
    return { success: false, errCode: "unauthorized_access" };
  else return { success: true };
};

// Invitee accepted manager invitation
export const PATCH = updateRequest({
  handler: async ({ user_id, params }) => {
    const { id } = params;

    await Thread.findByIdAndUpdate(id, {
      $addToSet: { managers: user_id },
      $pull: { invitees: user_id },
    });

    return {
      success: true,
      result: null,
      available: "threadManagersMutation_tid",
      options: { tid: id },
    };
  },
  preCheck: async ({ params, user_id }) => await precheck(params.id, user_id),
});

// Invitee rejected manager invitation
export const DELETE = deleteRequest(async ({ user_id, params }) => {
  const { id } = params;
  const resp = await precheck(id, user_id);
  if (!resp.success) return resp;

  await Thread.findByIdAndUpdate(id, {
    $pull: { invitees: user_id },
  });

  return {
    success: true,
    result: null,
    available: "threadInviteesMutation_tid",
    options: { tid: id },
  };
});
