import { getRequest, postRequest } from "@lib/helpers/common";
import { addItemsInList } from "@lib/helpers/server";
import { listsAggregationPipeline } from "@lib/pipelines";
import { listServerSchema } from "@lib/schemas";
import { getPageParams } from "@lib/utils";
import { List } from "@model";
import { ListSchemaType } from "@type/schemas";

// Fetching Private lists for a user
export const GET = getRequest(async (r: any, params: { cuid: string }) => {
  const { cuid } = params;
  const page = getPageParams(r);

  const lists = await List.aggregate(
    listsAggregationPipeline({
      filters: [{ $match: { user_id: cuid, isPrivate: true } }],
      sort: { createdAt: -1 },
      page,
    })
  );

  return { success: true, result: lists ?? [] };
});

// Creating a new list
export const POST = postRequest({
  handler: async ({ data, session, user_id }) => {
    const listKey = data.isPrivate
      ? crypto.randomUUID().replaceAll("-", "")
      : null;

    const { items, ...rest } = data as ListSchemaType;

    const dataToSave = {
      ...rest,
      poster: items[items.length - 1]?.poster ?? "",
      key: listKey,
      user_id,
      item_count: items.length,
    };

    const list = (
      await List.create([dataToSave], { session, ordered: true })
    )[0];

    await addItemsInList(items, list._id, user_id, session);

    return {
      success: true,
      available: "listCreation_lid",
      options: { lid: list._id },
      result: list,
    };
  },
  schema: listServerSchema,
});
