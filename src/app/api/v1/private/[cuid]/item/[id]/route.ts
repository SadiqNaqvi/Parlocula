import { filterToSort } from "@lib/constants";
import { connectPPDB } from "@lib/database";
import { getRequest } from "@lib/helpers/common";
import { itemsAggregationPipeline } from "@lib/pipelines";
import { cinementToAddAndRemove } from "@lib/schemas";
import { formDataToObject, getPageParams, ObjectId } from "@lib/utils";
import { Item, List, Media } from "@model";
import { length } from "localforage";
import { startSession } from "mongoose";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// Getting items for a private lists, id = list_id
export const GET = getRequest(
  async (r: any, params: { id: string; cuid: string }) => {
    const { id } = params; // List_id
    const page = getPageParams(r) - 1;
    const filter = r.nextUrl.searchParams.get("f")?.trim() || "latest";
    const sort = filterToSort.items[filter] ?? filterToSort.items.latest;

    const key = r.nextUrl.searchParams.get("k");
    if (!key) return { success: false, errCode: "pp201" };

    const items = await Item.aggregate([
      ...itemsAggregationPipeline({
        filters: [{ $match: { list_id: ObjectId(id) } }],
        page,
        sort,
      }),

      // To validate the key in the params we are fetching the list and then we will match both the keys
      {
        $addFields: {
          list_id: ObjectId(id),
        },
      },
      {
        $lookup: {
          from: "lists",
          localField: "list_id",
          foreignField: "_id",
          as: "list",
        },
      },
    ]);

    const result = items[0];

    if (!result) return { success: false, errCode: "pp104" };

    const list = result.list[0];
    if (key !== list.key) return { success: false, errCode: "pp201" };

    return {
      success: true,
      result: {
        total: result.total,
        data: result.data,
      },
    };
  }
);

// Adding/Removing an item to/from multiple lists, id = media_id
export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string; cuid: string } }
) => {
  const { id, cuid } = params;

  if (!cuid)
    return NextResponse.json({
      success: false,
      errCode: "pp202",
    });

  const formData = formDataToObject(await req.formData());
  const { success, error, data } = cinementToAddAndRemove.safeParse(formData);
  if (!success)
    return NextResponse.json({
      success: false,
      errCode: "pp203",
      formErrors: error.errors,
    });

  const session = await startSession();
  let idsToRevalidate: string[] = [];

  try {
    const isDbConnected = await connectPPDB();
    if (!isDbConnected)
      return NextResponse.json({
        result: null,
        success: false,
        errCode: "pp101",
      });

    const { add, remove, tmdb_id, year, favourite, recommended, watched } =
      data;

    const dataToCreate = add.map((list_id) => ({
      list_id,
      year,
      tmdb_id,
      media_id: id,
      user_id: cuid,
    }));

    session.startTransaction();
    if (dataToCreate.length) {
      await Item.create(dataToCreate, { session, ordered: true });
      await List.updateMany(
        { _id: { $in: add } },
        { $inc: { item_count: 1 } },
        { session }
      );
    }

    if (remove.length) {
      await Item.deleteMany({ _id: id, list_id: { $in: remove } }, { session });
      await List.updateMany(
        { _id: { $in: remove } },
        { $inc: { item_count: -1 } },
        { session }
      );
    }

    if (favourite !== "none" || recommended !== "none" || watched !== "none") {
      await Media.findOneAndUpdate(
        { _id: ObjectId(id) },
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
      idsToRevalidate.push(`media-${tmdb_id}`);
    }

    await session.commitTransaction();
    idsToRevalidate.concat(add).concat(remove);
    return NextResponse.json({
      success: true,
      result: idsToRevalidate,
    });
  } catch (err: any) {
    console.error("Error occured at path: private/item/[id]/", err.message);
    await session.abortTransaction();
    idsToRevalidate = [];
    return NextResponse.json(
      {
        success: false,
        errCode: "pp100",
      },
      { status: 500 }
    );
  } finally {
    // Can do this in try block but it sometimes throw error.
    idsToRevalidate.forEach((id) => {
      revalidateTag(`items-${id}-1-latest`);
    });
    console.log(idsToRevalidate.length);
    if (idsToRevalidate.length) {
      revalidateTag(`listsForMedia-${id}-user-${cuid}`);
      console.log("ho gya");
    }
  }
};
