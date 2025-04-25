import { getRequest } from "@lib/helpers/common";
import { filterToSort, predefinedUserLists, queryLimit } from "@lib/constants";
import { connectPPDB } from "@lib/database";
import { itemToAddAndRemove } from "@lib/schemas";
import { formDataToObject, getPageParams, ObjectId } from "@lib/utils";
import { Item, List, Media } from "@model";
import { startSession } from "mongoose";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Getting items for a private lists, id = list_id
export const GET = getRequest(async (r: any, params: { id: string }) => {
  const { id } = params; // List_id
  const page = getPageParams(r) - 1;
  const filter = r.nextUrl.searchParams.get("f")?.trim() || "latest";
  const sort = filterToSort.items[filter] ?? filterToSort.items.latest;

  const cookieStore = cookies();
  const user_id = cookieStore.get("user_id")?.value;
  if (!user_id) return { success: false, errCode: "pp202" };

  const key = r.nextUrl.searchParams.get("k");
  if (!key) return { success: false, errCode: "pp201" };

  const items = await Media.aggregate([
    { $match: { list_id: ObjectId(id) } },
    {
      $facet: {
        total: [{ $count: "count" }],
        data: [
          { $sort: sort },
          { $skip: page * queryLimit },
          { $limit: queryLimit },
          {
            $lookup: {
              from: "items",
              localField: "media_id",
              foreignField: "_id",
              as: "item",
            },
          },
          {
            $addFields: {
              title: { $arrayElemAt: ["$item.title", 0] },
              poster: {
                $ifNull: [{ $arrayElemAt: ["$item.poster", 0] }, ""],
              },
              tmdb_id: { $arrayElemAt: ["$item.tmdb_id", 0] },
            },
          },
        ],
      },
    },
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

  if (!items) return { success: false, errCode: "pp204" };

  const list = items[0]?.list[0];
  if (key !== list.key) return { success: false, errCode: "pp201" };

  const result = {
    total: items[0].total[0].count,
    data: items[0].data,
  };
  return { success: true, result };
});

// Adding/Removing an item to/from multiple lists, id = media_id
export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { id } = params;

  const cookieStore = cookies();
  const user_id = cookieStore.get("user_id")?.value;
  if (!user_id)
    return NextResponse.json({
      success: false,
      errCode: "pp202",
    });

  const formData = formDataToObject(await req.formData());
  const { success, error, data } = itemToAddAndRemove.safeParse(formData);
  if (!success)
    return NextResponse.json({
      success: false,
      errCode: "pp203",
      formErrors: error.errors,
    });

  const session = await startSession();
  const idsToRevalidate: any[] = [];
  try {
    const isDbConnected = await connectPPDB();
    if (!isDbConnected)
      return NextResponse.json({
        result: null,
        success: false,
        errCode: "pp101",
      });

    const { add, remove, tmdb_id, year } = data;

    const dataToCreate = add.map((list_id) => ({
      list_id,
      year,
      tmdb_id,
      media_id: id,
      user_id,
    }));

    session.startTransaction();
    if (dataToCreate.length) {
      await Item.create(dataToCreate, { session });
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

    await session.commitTransaction();
    idsToRevalidate.concat(add).concat(remove);
    return {
      success: true,
      result: null,
    };
  } catch (err: any) {
    console.error("Error occured at path: private/item/[id]/", err.message);
    await session.abortTransaction();
  } finally {
    idsToRevalidate.forEach((id) => {
      revalidateTag(`items-${id}-1-latest`);
    });
  }
};
