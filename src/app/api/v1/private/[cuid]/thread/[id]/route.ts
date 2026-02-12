import { parloculaAppURL } from "@lib/constants";
import { updateHandler } from "@lib/helpers/handlers";
import { threadUpdateSchema } from "@lib/schemas";
import { Member, Thread } from "@model";
import { ThreadUpdateSchema } from "@type/schemas";

// Making sure that only managers are allowed to update a thread.
export const PATCH = updateHandler<ThreadUpdateSchema>({
  handler: async ({ data, frames, params, username, user_id, isNsfw }) => {

    const dataToUpdate = Object({
      ...data,
      edited_at: new Date(),
      edited_by: username,
      ...(frames.length && { poster: frames[0] }),
    });

    const doc = await Thread.findByIdAndUpdate(params.id, { $set: dataToUpdate }).then(r => r?.toObject());
    if (!doc) return { success: false, errCode: "resource_not_found" }

    return {
      success: true,
      available: "threadMutation_tid_uid",
      options: { tid: params.id, uid: user_id },
      result: doc,
      warnTeamParlocula: doc.nsfw || !isNsfw ? undefined : {
        title: "Possibly NSFW Poster of the Thread with incorrect flags",
        desc: "This poster of the thread may be NSFW",
        path: `${parloculaAppURL}/t/${doc._id}`
      }
    };
  },
  preCheck: async ({ user_id, params }) => {
    const { id } = params;

    const isManager = await Member.exists({
      user_id,
      thread_id: id,
      role: { $in: ["moderator", "creator"] },
      banned: false,
    });

    if (isManager) return { success: true };

    return { success: false, errCode: "unauthorized_access" };
  },
  schema: threadUpdateSchema,
});