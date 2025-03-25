import { postRequest } from "@lib/actions/actions";
import { ThreadSchemaServer, threadSchemaServer } from "@lib/schemas";
import { Member, Thread } from "@model";

export const POST = postRequest({
  handler: async ({ data, frames, user_id, session, username }) => {
    const { name, description, tags, links, nsfw } = data as ThreadSchemaServer;

    const dataToStore = {
      name,
      description,
      tags,
      nsfw,
      links,
      created_by: user_id,
      poster: frames[0]?.path ?? "",
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
      available: "threadCreation_tid_username",
      options: { tid: result._id, username },
    };
  },
  schema: threadSchemaServer,
});
