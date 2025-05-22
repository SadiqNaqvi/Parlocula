"use server";

import { getSession } from "@lib/auth";
import { ObjectId } from "@lib/utils";
import { Item, Media } from "@model";
import { MediaItemType, Session } from "@type/internal";
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary";
import { ClientSession } from "mongoose";
import { NextRequest } from "next/server";

import { render } from "@react-email/components";
import { createTransport } from "nodemailer";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_CLOUD_API_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_API_SECRET,
});

type DeleteApiResponse = {
  deleted: Record<string, "deleted" | "not_found" | "error">;
  partial: boolean;
};

export const mediaUploader = async (
  file: File,
  options?: UploadApiOptions
): Promise<
  | { result: UploadApiResponse; error: string; success: true }
  | { result: null; error: string; success: false }
> => {
  if (!file) return { result: null, error: "No file found.", success: false };

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(options, (err, res) => {
        if (err || !res) reject(err);
        else resolve(res);
      });
      stream.end(buffer);
    });

    return { result, success: true, error: "" };
  } catch (err) {
    console.error("Failed To Upload Media", err);
    return {
      result: null,
      success: false,
      error: "Something went wrong! Please Try again",
    };
  }
};

export const deleteMedia = async (file: {
  path: string;
  type: "image" | "video";
}) => {
  if (!file) return false;
  try {
    const resp: DeleteApiResponse = await cloudinary.uploader.destroy(
      file.path,
      {
        resource_type: file.type,
      }
    );
    if (resp.deleted[file.path] !== "deleted")
      throw new Error(`Unable to delete file`);
    return true;
  } catch (err: any) {
    console.error(
      `Error occured while deleting resource by id-${file.path}`,
      err.message
    );
    return false;
  }
};

export const deleteMultipleMedia = async (
  files: { path: string; type: "image" | "video" }[]
) => {
  if (!files || !files.length) return false;

  const imageFiles = files.filter((f) => f.type === "image").map((e) => e.path);
  const videoFiles = files.filter((f) => f.type === "video").map((e) => e.path);
  const undone: string[] = [];
  try {
    const imageResult: DeleteApiResponse =
      await cloudinary.api.delete_resources(imageFiles, {
        resource_type: "image",
      });

    const videoResult: DeleteApiResponse =
      await cloudinary.api.delete_resources(videoFiles, {
        resource_type: "video",
      });

    Object.keys(imageResult.deleted).forEach((id) => {
      if (imageResult.deleted[id] !== "deleted") undone.push(id);
    });

    Object.keys(videoResult.deleted).forEach((id) => {
      if (videoResult.deleted[id] !== "deleted") undone.push(id);
    });

    if (undone.length)
      console.error(
        `Unable to delete ${undone.length} files, id: ${undone.join(", ")}`
      );

    return true;
  } catch (err: any) {
    console.error(
      `Error occured while deleting resource by id-${files.join(", ")}`,
      err.message
    );
    return false;
  }
};

export const multipleMediaUploader = async (
  file: File,
  options?: UploadApiOptions
): Promise<
  | { result: UploadApiResponse; error: string; success: true }
  | { result: null; error: string; success: false }
> => {
  if (!file) return { result: null, error: "No file found.", success: false };

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(options, (err, res) => {
        if (err || !res) reject(err);
        else resolve(res);
      });
      stream.end(buffer);
    });

    return { result, success: true, error: "" };
  } catch (err) {
    console.error("Failed To Upload Media", err);
    return {
      result: null,
      success: false,
      error: "",
    };
  }
};

export const getCurrentUser = async (
  req: NextRequest
): Promise<Session | null> => {
  const session_id = req.cookies.get("sid")?.value;
  if (!session_id) return null;
  const user = await getSession(session_id);
  return user;
};

type Item =
  | {
      isConfirm: true;
      media_id: string;
    }
  | {
      isConfirm: false;
      media_id: undefined;
    };

export const addItemsInList = async (
  items: (MediaItemType & Item)[],
  id: string,
  user_id: string,
  session: ClientSession
) => {
  if (!items || !items.length) return;

  // Step 1: Separate confirmed and unconfirmed items
  const confirmedItems = items.filter((item) => item.isConfirm === true);
  const unconfirmedItems = items.filter((item) => item.isConfirm === false);

  // Step 2: Find existing items for unconfirmed items
  const tmdbIds = unconfirmedItems.map((item) => item.tmdb_id);
  const existingItems = tmdbIds.length
    ? await Media.find({ tmdb_id: { $in: tmdbIds } }, null, {
        session,
        ordered: true,
      })
    : [];

  // Step 3: Create missing items and get all item IDs
  const itemsToCreate = unconfirmedItems.filter(
    (item) =>
      !existingItems.some((existing) => existing.tmdb_id === item.tmdb_id)
  );

  let createdItems = [];
  if (itemsToCreate.length > 0) {
    createdItems = await Media.create(
      itemsToCreate.map((item) => ({
        tmdb_id: item.tmdb_id,
        year: item.year,
        media_type: item.media_type,
        title: item.title,
        poster: item.poster,
      })),
      { session, ordered: true }
    );
  }

  // Step 4: Create a map of tmdb_id to media_id
  const itemIdMap = new Map<string, string>();

  // Add existing and newly created items to the map
  existingItems.concat(createdItems).forEach(({ tmdb_id, _id }) => {
    itemIdMap.set(tmdb_id, _id.toString());
  });

  //Add Confirmed items to the map
  confirmedItems.forEach(({ tmdb_id, media_id }) => {
    itemIdMap.set(tmdb_id, media_id);
  });

  // Step 5: Create list items
  const itemsArr = items.map((item) => ({
    list_id: ObjectId(id),
    user_id: ObjectId(user_id),
    media_id: itemIdMap.get(item.tmdb_id),
    tmdb_id: item.tmdb_id,
    year: item.year,
    createdAt: new Date(),
  }));

  if (itemsArr.length > 0) {
    await Item.create(itemsArr, { session, ordered: true });
  }
};
