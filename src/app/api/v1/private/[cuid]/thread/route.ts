import { postRequest } from "@lib/helpers/common";
import { threadSchemaServer } from "@lib/schemas";
import { ThreadSchemaServer } from "@type/schemas";
import { Member, Thread } from "@model";

// Creating a thread
export const POST = postRequest({
  handler: async ({ data, frames, user_id, session }) => {
    const { name, description, links, nsfw } = data as ThreadSchemaServer;

    const poster = frames[0]?.path ?? "";

    const dataToStore = {
      name,
      description,
      nsfw,
      links,
      created_by: user_id,
      poster,
    };

    const resp = await Thread.create([dataToStore], { session });
    const result = resp[0];

    await Member.create(
      [
        {
          thread_id: result._id,
          user_id,
        },
      ],
      { session }
    );

    return {
      result,
      success: true,
      errCode: null,
      available: "threadMutation_tid",
      options: { tid: result._id },
    };
  },
  schema: threadSchemaServer,
});
