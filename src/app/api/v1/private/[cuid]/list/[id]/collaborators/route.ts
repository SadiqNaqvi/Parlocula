import { listCollaboratorsLimit, threadManagersLimit } from "@lib/constants";
import { getRequest, postRequest, updateRequest } from "@lib/helpers/common";
import { sendNotification } from "@lib/helpers/server";
import { isValidObjectId, ObjectId } from "@lib/utils";
import { Follow, List } from "@model";
import { ListModelType } from "@type/models";
import { z } from "zod";

// Get all the collaborators and invitees of a list
export const GET = getRequest(async (r, params) => {
  const { id, cuid } = params;
  const list = await List.aggregate([
    { $match: { _id: ObjectId(id), user_id: ObjectId(cuid) } },
    {
      $lookup: {
        from: "users",
        as: "collaborator",
        localField: "collaborators",
        foreignField: "_id",
      },
    },
    {
      $lookup: {
        from: "users",
        as: "invited",
        localField: "invitees",
        foreignField: "_id",
      },
    },
    {
      $project: {
        collaborator: {
          username: 1,
          profile: 1,
          _id: 1,
        },
        invited: {
          username: 1,
          profile: 1,
          _id: 1,
        },
        name: 1,
        user_id: 1,
      },
    },
  ]);

  if (!list || !list[0]) return { success: false, errCode: "resource_not_found" };

  const collaborators = list[0].collaborator ?? [];
  const invitees = list[0].invited ?? [];
  const { name, user_id } = list[0];

  return { success: true, result: { collaborators, invitees, name, user_id } };
});

const postSchema = z.object({
  users: z
    .array(z.string())
    .refine(
      (a) => a.length > 1 && a.length < listCollaboratorsLimit,
      `At least one and upto ${threadManagersLimit} users should be selected.`
    )
    .refine((a) => a.every((u) => isValidObjectId(u))),
  list_name: z.string(),
});

const patchSchema = z.object({
  users: z
    .array(z.string())
    .refine(
      (a) => a.length > 1 && a.length < listCollaboratorsLimit,
      `At least one and upto ${threadManagersLimit} users should be selected.`
    )
    .refine((a) => a.every((u) => isValidObjectId(u))),
});

// Invite followers to collaborate in one of user's lists
export const POST = postRequest<z.infer<typeof postSchema>>({
  handler: async ({ data, params, user_id, username, session }) => {
    const { id } = params;
    const { users, list_name } = data;

    const list = await List.findByIdAndUpdate<ListModelType>(
      id,
      {
        $addToSet: { invitees: { $each: users } },
      },
      { session, new: true }
    );

    if (
      !list ||
      list.collaborators.length + list.invitees.length > listCollaboratorsLimit
    )
      return { success: false, errCode: "unauthorized_access" };

    await sendNotification(
      users.map((u) => ({
        title: `${username} has invited you to collaborate in one of their lists`,
        path: "/notifications",
        message: [
          { type: "link", label: username, path: `/u/${username}` },
          {
            type: "text",
            text: "has invited you to collaborate in one of their lists",
          },
          { type: "link", label: list_name, path: `/l/${id}` },
        ],
        type: "request",
        user_id: u,
        metadata: {
          list_id: id,
          sender_id: user_id,
        },
        request_type: "collaborator_invitation",
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
  preCheck: async ({ data, user_id, params }) => {
    const { id } = params;
    const { users } = data;

    // Check 1: Make sure all the added users are a follower of the current user.
    const followers = await Follow.find(
      {
        follower: { $in: users.map((u) => ObjectId(u)) },
        followee: ObjectId(user_id),
        blocked: false,
      },
      { _id: 1 }
    );

    if (followers.length !== users.length)
      return { success: false, errCode: "unauthorized_access" };

    // Check 2: Make sure only the creator of the list can invite people
    // Check 3: Make sure invitees + collaborators <= collaboratos limit
    const list = await List.findById<ListModelType>(id, {
      user_id: 1,
      collaborators: 1,
      invitees: 1,
    });
    if (
      !list ||
      list.user_id !== user_id ||
      (list.collaborators ?? []).length + (list.invitees ?? []).length >
        listCollaboratorsLimit
    )
      return { success: false, errCode: "unauthorized_access" };

    return { success: true };
  },
});

// Kick collaborators or invitees
export const PATCH = updateRequest<z.infer<typeof patchSchema>>({
  handler: async ({ data, params }) => {
    const { id } = params;
    const { users } = data;

    await List.findByIdAndUpdate(id, {
      $pull: { invitees: { $in: users }, collaborators: { $in: users } },
    });

    return {
      success: true,
      result: null,
      available: "listCollaboratorsMutation_lid",
      options: { lid: id },
    };
  },
  schema: patchSchema,
  preCheck: async ({ params, user_id }) => {
    const { id } = params;
    const list = await List.findById(id, { user_id: 1 });

    if (list.user_id === user_id) return { success: true };
    return { success: false, errCode: "unauthorized_access" };
  },
});
