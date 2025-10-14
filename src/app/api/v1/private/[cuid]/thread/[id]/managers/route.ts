import { threadManagersLimit } from "@lib/constants";
import { getRequest, postRequest, updateRequest } from "@lib/helpers/common";
import { sendNotification } from "@lib/helpers/server";
import { isValidObjectId, ObjectId } from "@lib/utils";
import { Member, Thread } from "@model";
import { ThreadModType } from "@type/internal";
import { z } from "zod";

const postSchema = z.object({
  users: z
    .array(z.string())
    .refine(
      (a) => a.length > 1 && a.length < threadManagersLimit,
      `At least one and upto ${threadManagersLimit} users should be selected.`
    )
    .refine((a) => a.every((u) => isValidObjectId(u))),
  thread_name: z.string(),
});

const patchSchema = z.object({
  users: z
    .array(z.string())
    .refine(
      (a) => a.length > 1 && a.length < threadManagersLimit,
      `At least one and upto ${threadManagersLimit} users should be selected.`
    )
    .refine((a) => a.every((u) => isValidObjectId(u))),
});

// Get Managers and Invitees of the thread. Can only get by Moderators.
export const GET = getRequest(
  async (_, params: { id: string; cuid: string }) => {
    const { id, cuid } = params;
    const modsAndInvitees = await Member.aggregate<ThreadModType>([
      {
        $match: {
          thread_id: ObjectId(id),
          role: { $or: ["moderator", "moderator_invitee"] },
        },
      },
      { $limit: threadManagersLimit },
      {
        $lookup: {
          from: "users",
          as: "user",
          localField: "user_id",
          foreignField: "_id",
        },
      },
      {
        $addFields: {
          username: { $arrayElemAt: ["$user.username", 0] },
          profile: { $arrayElemAt: ["$user.profile", 0] },
          followers: { $arrayElemAt: ["$user.followers", 0] },
          posts: { $arrayElemAt: ["$user.posts", 0] },
        },
      },
      { $project: { user: 0 } },
    ]);

    if (
      !modsAndInvitees.find((m) => m.user_id === cuid && m.role === "moderator")
    )
      return { success: false, errCode: "unauthorized_access" };

    return {
      success: true,
      result: modsAndInvitees,
    };
  }
);

// Apply pre-checks to check if the current user is a moderator. Make sure all the invitees are members of the thread.
const precheck = async (tid: string, uid: string, users: string[]) => {
  const response = await Member.aggregate([
    {
      $match: {
        thread_id: ObjectId(tid),
        banned: false,
        user_id: ObjectId(uid),
        role: "moderator",
      },
    },
    {
      $facet: {
        // Count total current moderators and invitees
        totalModsAndInvitees: [
          {
            $match: {
              role: { $in: ["moderator", "moderator_invitee"] },
            },
          },
          {
            $count: "count",
          },
        ],
      },
    },
  ]);

  const result = response[0];

  // If the current user is a member as well as a Moderator of the thread or not.
  if (!result) return { success: false, errCode: "unauthorized_access" };

  const { totalModsAndInvitees } = result as {
    totalModsAndInvitees: { count: number }[];
  };

  // Moderators + Mod Invitees + UsersToInvite should be less than equal to {threadManagersLimit}.
  if (totalModsAndInvitees[0].count + users.length >= threadManagersLimit + 1)
    return { success: false, errCode: "unauthorized_access" };
  else return { success: true };
};

// Invite users to become manager in a thread. Only Moderators (creators/managers) can do this.
export const POST = postRequest<{ users: string[]; thread_name: string }>({
  handler: async ({ data, username, params, user_id, session }) => {
    const { id } = params;
    const { users, thread_name } = data;

    await Member.updateMany(
      {
        thread_id: ObjectId(id),
        user_id: { $in: users },
        banned: false,
        role: "member",
      },
      {
        $set: { role: "moderator_invitee" },
      },
      { session }
    );

    await sendNotification(
      users.map((u) => ({
        title: `${username} has invited you to become a manager of thread`,
        path: "/notifications",
        message: [
          { type: "link", label: username, path: `/u/${username}` },
          {
            type: "text",
            text: "has invited you to become a manager of thread",
          },
          { type: "link", label: thread_name, path: `/t/${id}` },
        ],
        type: "request",
        user_id: u,
        metadata: {
          thread_id: id,
          sender_id: user_id,
        },
        request_type: "manager_invitation",
        status: "pending",
      })),
      session
    );

    return {
      success: true,
      result: null,
      revalidateQueue: users.map((u) => `notifications-user-${u}`),
    };
  },
  schema: postSchema,
  preCheck: async ({ user_id, params, data }) =>
    await precheck(params.id, user_id, data.users),
});

// Demote Managers or Invitees. Should ONLY done by the Creator.
export const PATCH = updateRequest<{ users: string[] }>({
  handler: async ({ data, params, session }) => {
    const { id } = params;
    await Member.updateMany(
      {
        thread_id: ObjectId(id),
        user_id: { $in: data.users.map((u) => ObjectId(u)) },
      },
      {
        $set: { role: "member" },
      },
      { session }
    );
    return {
      success: true,
      result: null,
      revalidateQueue: data.users.map((u) => `member-thread-${id}-user-${u}`),
    };
  },
  preCheck: async ({ user_id, params }) => {
    const resp = await Thread.findById(params.id, { created_by: 1 });
    if (!resp || resp.created_by !== user_id)
      return { success: false, errCode: "unauthorized_access" };
    return { success: true };
  },
  schema: patchSchema,
});
