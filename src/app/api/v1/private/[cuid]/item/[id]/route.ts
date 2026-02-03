import { filterToSort } from "@lib/constants";
import { getHandler, postHandler } from "@lib/helpers/handlers";
import { itemsAggregationPipeline } from "@lib/pipelines";
import { cinementToAddAndRemove } from "@lib/schemas";
import { getSearchParams } from "@lib/utils";
import { Cinement, Shelf, ShelfItem } from "@model";
import { CinementToAddAndRemoveType } from "@type/schemas";

// Getting items for a shelf including private, id = shelf_id
export const GET = getHandler(async (r, params) => {
  const { id } = params; // shelf_id

  const { page, filter } = getSearchParams(r.nextUrl, 0, "latest");

  const sort = filterToSort.items[filter] ?? filterToSort.items.latest;

  const key = r.nextUrl.searchParams.get("k");

  const shelfResponse = await Shelf.findById(id, { shelfKey: 1, isPrivate: 1, user_id: 1 }).exec();

  if (!shelfResponse) return { success: false, errCode: "resource_not_found" }

  const response = await ShelfItem.aggregate(
    itemsAggregationPipeline({
      filters: [{ $match: { shelf_id: id } }],
      page,
      sort,
      shelf_creator: shelfResponse.user_id,
    })
  );

  const items = response[0];

  if (!items)
    return { success: true, result: { data: [], total: 0 } };

  const shelf = shelfResponse.toObject();

  if (shelf.isPrivate && (!key || (key !== shelf.shelfKey)))
    return { success: false, errCode: "unauthorized_access" };

  return { success: true, result: items };
}
);

// Adding/Removing a cinement to/from multiple shelves, id = cinement_id
// Must only be done by the creator
export const POST = postHandler<CinementToAddAndRemoveType>({
  handler: async ({ data, params, session }) => {

    const { id, cuid } = params;
    const { add, remove, ext_id, year, favourite, recommended, watched } =
      data;

    const dataToCreate = add.map((shelf_id) => ({
      shelf_id,
      year,
      ext_id,
      cinement_id: id,
      user_id: cuid,
    }));

    if (dataToCreate.length) {

      await ShelfItem.create(dataToCreate, { session, ordered: true });

      await Shelf.updateMany(
        { _id: { $in: add } },
        { $inc: { item_count: 1 } },
        { session }
      );

    }

    if (remove.length) {

      await ShelfItem.deleteMany({ cinement_id: id, shelf_id: { $in: remove } }, { session });

      await Shelf.updateMany(
        { _id: { $in: remove } },
        { $inc: { item_count: -1 } },
        { session }
      );

    }

    let idsToRevalidate: string[] = [];

    if (favourite !== "none" || recommended !== "none" || watched !== "none") {

      await Cinement.findOneAndUpdate(
        { _id: id },
        {
          $inc: {
            favourite:
              favourite === "added" ? 1 : favourite === "removed" ? -1 : 0,
            watched: watched === "added" ? 1 : watched === "removed" ? -1 : 0,
            recommended:
              recommended === "added" ? 1 : recommended === "removed" ? -1 : 0,
          },
        },
        { session }
      );

      idsToRevalidate.push(`cinement-${ext_id}`);
    }

    return {
      success: true,
      result: null,
      revalidateQueue: idsToRevalidate
        .concat(add.concat(remove).map(id => `items-${id}-1-latest`))
        .concat([`shelvesForCinement-${id}-user-${cuid}`])
    }
  },
  preCheck: async ({ data, user_id }) => {
    const { add, remove } = data;
    const shelves = await Shelf.find({
      _id: { $in: [...add, ...remove] }
    }, { user_id: 1 });

    if (!shelves.length) return {
      success: false,
      errCode: "resource_not_found"
    }

    const isCreator = shelves.every(shelf => shelf.user_id === user_id);

    if (!isCreator) return {
      success: false,
      errCode: "unauthorized_access"
    }

    return { success: true }

  },
  schema: cinementToAddAndRemove,
});
