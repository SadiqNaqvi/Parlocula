import { filterToSort } from "@lib/constants";
import { getHandler, postHandler } from "@lib/helpers/handlers";
import { addItemsInShelf, sendNotification } from "@lib/helpers/server";
import { getFollowersToNotify, shelvesAggregationPipeline } from "@lib/pipelines";
import { shelfServerSchema } from "@lib/schemas";
import { getPageParams, parloId } from "@lib/utils";
import { Shelf, User } from "@model";
import { ShelfSchemaType } from "@type/schemas";

// Fetching only custom && private shelves of the user.
export const GET = getHandler(async (r, params) => {
  const { cuid } = params;
  const page = getPageParams(r) - 1;

  const shelves = await Shelf.aggregate(
    shelvesAggregationPipeline({
      filters: [{
        $match: { user_id: cuid, isPrivate: true, shelf_type: "custom" }
      }],
      sort: { createdAt: -1 },
      page,
    })
  );

  return { success: true, result: shelves[0] ?? { data: [], total: 0 } };
});

// Creating a new shelf
export const POST = postHandler<ShelfSchemaType>({
  handler: async ({ data, session, user_id, username, profile }) => {

    const shelfKey = data.isPrivate
      ? crypto.randomUUID().replaceAll("-", "")
      : undefined;

    const { items, ...rest } = data;

    const shelf = (
      await Shelf.create([
        {
          ...rest,
          poster: items.at(-1)?.poster ?? "",
          shelfKey,
          user_id,
          shelf_type: "custom",
          item_count: items.length,
        }
      ], { session, ordered: true })
    )[0];

    const allTaleons = await addItemsInShelf(
      items,
      "custom",
      shelf._id,
      user_id,
      session
    );

    if (!data.isPrivate) {
      const followers = await getFollowersToNotify(user_id, 100);

      await sendNotification(
        followers.map(({ follower }) => follower),
        {
          title: `${username} has created a new shelf`,
          path: `/shelf/${shelf._id}`,
          poster: profile,
          message: [
            { type: "link", label: username, path: `/user/${username}` },
            { type: "text", text: "has created a new shelf" },
            { type: "link", label: data.name, path: `/shelf/${shelf._id}` },
          ],
        },
        session
      );

      await User.findByIdAndUpdate(user_id, {
        $set: { lastShelfCreatedAt: new Date() },
        $inc: { publicShelves: 1 }
      }, { session })
    } else {
      await User.findByIdAndUpdate(user_id, {
        $set: { lastShelfCreatedAt: new Date() },
      }, { session })
    }

    return {
      success: true,
      revalidateQueue: allTaleons
        .map(c => `shelvesForTaleon-${c.taleon_id}-user-${user_id}`)
        .concat([
          `shelves-user-${user_id}`,
          `private-shelves-user-${user_id}`,
          `allShelves-user-${user_id}`
        ]),
      result: shelf,
    };
  },
  schema: shelfServerSchema,
});
