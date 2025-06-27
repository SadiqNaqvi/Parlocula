"use server";

import {
  generateToken,
  getSession,
  storeSession,
  verifyToken,
} from "@lib/auth";
import { ObjectId } from "@lib/utils";
import { Item, Media } from "@model";
import { GeneralGetReturn, MediaItemType } from "@type/internal";
import VerifyEmail from "@components/EmailTemplates/verification";
import {
  v2 as cloudinary,
  UploadApiOptions,
  UploadApiResponse,
} from "cloudinary";
import { ClientSession } from "mongoose";
import { render } from "@react-email/components";
import { createTransport } from "nodemailer";
import { cookies } from "next/headers";
import { emailLimit, oneHour } from "@lib/constants";
import { DeviceLimitation } from "@type/other";
import { randomInt } from "crypto";
import { storeToRedis } from "@lib/auth/session";
import bcrypt from "bcrypt";
import { CinementModelType, ListItemModelType } from "@type/models";
import { CinementSchemaType } from "@type/schemas";

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

export const addItemsInList = async (
  items: CinementSchemaType[],
  list_type: "custom" | "favourite" | "recommended" | "watched",
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
      itemsToCreate.map(
        (item) =>
          ({
            tmdb_id: item.tmdb_id,
            year: item.year,
            media_type: item.media_type,
            title: item.title,
            poster: item.poster,
            favourite: list_type === "favourite" ? 1 : 0,
            watched: list_type === "watched" ? 1 : 0,
            recommended: list_type === "recommended" ? 1 : 0,
          }) as CinementModelType
      ),
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
  const itemsArr: ListItemModelType[] = items.map((item) => ({
    list_id: ObjectId(id),
    user_id: ObjectId(user_id),
    media_id: ObjectId(itemIdMap.get(item.tmdb_id) as string),
    tmdb_id: item.tmdb_id,
    year: item.year,
    createdAt: new Date(),
  }));

  if (itemsArr.length > 0) {
    await Item.create(itemsArr, { session, ordered: true });
  }
};

export const sendVerificationCode = async (
  email: string,
  fingerprint: string
): Promise<GeneralGetReturn> => {
  if (!fingerprint) return { success: false, errCode: "pp200" };
  const cookieStore = cookies();
  const limitaionToken = cookieStore.get("did")?.value;
  try {
    let payload = limitaionToken
      ? await verifyToken<DeviceLimitation>(limitaionToken)
      : null;

    if (!payload) {
      const redisResp = await getSession<DeviceLimitation>(
        `deviceLimits-${fingerprint}`
      );
      if (redisResp.success) payload = redisResp.result;
      else return redisResp as GeneralGetReturn;
    }

    const deviceLimts: DeviceLimitation = payload ?? {
      overall: 0,
      email: 0,
      expireAt: new Date().getTime() + 1000 * 3600,
    };

    if (
      deviceLimts.email >= emailLimit &&
      new Date().getTime() < deviceLimts.expireAt
    )
      return { success: false, errCode: "pp209" };

    const transportor = createTransport({
      service: "gmail",
      auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });
    const code = randomInt(100000, 1000000);
    const emailHtml = await render(VerifyEmail({ code }));
    await transportor.sendMail({
      from: process.env.GOOGLE_EMAIL,
      to: email,
      subject: "Email Verification",
      html: emailHtml,
    });

    const updatedLimits: DeviceLimitation = {
      ...deviceLimts,
      email: deviceLimts.email + 1,
    };

    await storeToRedis(`deviceLimits-${fingerprint}`, oneHour, updatedLimits);
    cookieStore.set("did", await generateToken(updatedLimits));

    const hash = await bcrypt.hash(`${code}`, 1);
    return { success: true, result: hash };
  } catch (err: any) {
    console.log("Error occured while sending verification email", err.message);
    return { success: false, errCode: "pp100" };
  }
};

export const verifyCodes = async ({
  inputCode,
  realCode,
}: {
  inputCode: string;
  realCode: string;
}) => {
  try {
    const compare = await bcrypt.compare(inputCode, realCode);
    console.log("Compared", compare);
    return compare;
  } catch (err: any) {
    console.error("Failed to compare codes", err.message);
    return false;
  }
};
