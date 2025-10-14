import { getRequest, postRequest } from "@lib/helpers/common";
import { addItemsInList, sendNotification } from "@lib/helpers/server";
import { getFollowers, listsAggregationPipeline } from "@lib/pipelines";
import { listServerSchema } from "@lib/schemas";
import { getPageParams } from "@lib/utils";
import { List } from "@model";
import { CinementSchemaType, ListSchemaType } from "@type/schemas";

// Fetching Private lists for a user
export const GET = getRequest(async (r: any, params: { cuid: string }) => {
  const { cuid } = params;
  const page = getPageParams(r);

  const lists = await List.aggregate(
    listsAggregationPipeline({
      filters: [
        { $match: { user_id: cuid, isPrivate: true, list_type: "custom" } },
      ],
      sort: { createdAt: -1 },
      page,
    })
  );

  return { success: true, result: lists ?? [] };
});

// Creating a new list
export const POST = postRequest<ListSchemaType>({
  handler: async ({ data, session, user_id, username }) => {
    const listKey = data.isPrivate
      ? crypto.randomUUID().replaceAll("-", "")
      : null;

    const { items, ...rest } = data;

    const dataToSave = {
      ...rest,
      poster: items.at(-1)?.poster ?? "",
      listKey,
      user_id,
      item_count: items.length,
    };

    const list = (
      await List.create([dataToSave], { session, ordered: true })
    )[0];

    await addItemsInList(
      items as CinementSchemaType[],
      "custom",
      list._id,
      user_id,
      session
    );

    if (!data.isPrivate) {
      const followers = await getFollowers(user_id, 100);
      await sendNotification(
        followers.map(({ follower }) => ({
          title: `${username} has created a new list`,
          path: `/l/${list._id}`,
          message: [
            { type: "link", label: username, path: `/u/${username}` },
            { type: "text", text: "has created a new list" },
            { type: "link", label: data.name, path: `/l/${list._id}` },
          ],
          user_id: follower,
        })),
        session
      );
    }

    return {
      success: true,
      available: "listMutation_lid_username",
      options: { lid: list._id, username },
      result: list,
    };
  },
  schema: listServerSchema,
});
