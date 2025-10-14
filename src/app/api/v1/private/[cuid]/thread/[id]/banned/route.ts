import { blockOrBanLimit } from "@lib/constants";
import { getRequest, postRequest, updateRequest } from "@lib/helpers/common";
import { membersAggregationPipeline } from "@lib/pipelines";
import { getPageParams, isValidObjectId, ObjectId } from "@lib/utils";
import { Member, Thread } from "@model";
import { z } from "zod";

const schema = z.object({
  users: z
    .array(z.string())
    .refine(
      (a) => a.length > 0 && a.length < blockOrBanLimit,
      `Select atleast 1 and upto ${blockOrBanLimit} members.`
    )
    .refine((a) => a.every((m) => isValidObjectId(m)), {
      path: ["custom"],
      message: "Member id is invalid! Please try again.",
    }),
});

// Check if the current user is a Moderator (managers and creator) or not
const validateUser = async (tid: string, uid: string) => {
  const isMod = await Member.exists({
    thread_id: tid,
    user_id: uid,
    role: "moderator",
    banned: false,
  });
  if (isMod) return true;
  return false;
};

// Get all the banned members of a thread
export const GET = getRequest(async (r: any, params: { id: string }) => {
  const { id } = params;
  const page = getPageParams(r, 1) - 1;
  const result = await Member.aggregate(
    membersAggregationPipeline({
      filters: [
        {
          $match: { thread_id: ObjectId(id), banned: true },
        },
      ],
      page,
      sort: { updateAt: -1 },
    })
  );

  const members = result[0];
  if (!members) return { success: false, errCode: "resource_not_found" };

  return { result: members, success: true };
});

// Ban users from a thread. Make sure only moderators (managers and creator) can ban a user.
export const PATCH = updateRequest<z.infer<typeof schema>>({
  handler: async ({ data, params, session }) => {
    const { id } = params;

    await Member.updateMany(
      {
        thread_id: ObjectId(id),
        user_id: data.users.map((u) => ObjectId(u)),
        role: "member",
      },
      {
        $set: { banned: true },
      },
      { session }
    );

    await Thread.findByIdAndUpdate(
      id,
      {
        $set: { member_count: -data.users.length },
      },
      { session }
    );

    return {
      success: true,
      result: null,
      revalidateQueue: data.users.map((m) => `member-thread-${id}-user-${m}`),
    };
  },
  preCheck: async ({ params, user_id }) => {
    const isValid = await validateUser(params.id, user_id);
    if (isValid) return { success: true };
    return { success: false, errCode: "unauthorized_access" };
  },
  schema,
});

// Un-ban users from a thread. Make sure only moderators (managers and creator) can un-ban a user.
// POST method because moderators can unban multiple users at the same time which is not supported by DELETE method

export const POST = postRequest<z.infer<typeof schema>>({
  handler: async ({ data, params, session }) => {
    const { id } = params;

    await Member.deleteMany(
      {
        thread_id: ObjectId(id),
        user_id: data.users.map((u) => ObjectId(u)),
      },
      { session }
    );

    return {
      success: true,
      result: null,
      revalidateQueue: data.users.map((m) => `member-thread-${id}-user-${m}`),
    };
  },
  preCheck: async ({ params, user_id }) => {
    const isValid = await validateUser(params.id, user_id);
    if (isValid) return { success: true };
    return { success: false, errCode: "unauthorized_access" };
  },
  schema,
});