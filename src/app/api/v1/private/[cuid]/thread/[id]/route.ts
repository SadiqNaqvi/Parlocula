import { updateRequest } from "@lib/helpers/common";
import { threadUpdateSchema } from "@lib/schemas";
import { Member, Thread } from "@model";
import { ThreadUpdateSchema } from "@type/schemas";

// Making sure that only managers and creator are allowed to update a thread.
export const PATCH = updateRequest<ThreadUpdateSchema>({
  handler: async ({ data, frames, params, user_id }) => {
    const dataToUpdate = Object({
      ...data,
      edited_at: new Date(),
      edited_by: user_id,
      ...(frames.length && { poster: frames[0].path }),
    });
    const doc = Thread.findByIdAndUpdate(params.id, { $set: dataToUpdate });

    return {
      success: true,
      available: "threadMutation_tid",
      options: { tid: params.id },
      result: doc,
    };
  },
  preCheck: async ({ user_id, params }) => {
    const { id } = params;
    const isMod = await Member.exists({
      user_id,
      thread_id: id,
      role: "moderator",
      banned: false,
    });

    if (isMod) return { success: true };

    return { success: false, errCode: "unauthorized_access" };
  },
  schema: threadUpdateSchema,
});