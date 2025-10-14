"use server";

import VerifyEmail from "@components/EmailTemplates/verification";
import { oneHour } from "@lib/constants";
import { getRedis } from "@lib/providers/redis";
import { verificationCodeSchema } from "@lib/schemas";
import { getTimeInFuture, ObjectId, objectToFormData } from "@lib/utils";
import { Item, Media, Notifications } from "@model";
import { render } from "@react-email/components";
import { GeneralGetReturn, GeneralPostReturn, GenericDate } from "@type/internal";
import {
  CinementModelType,
  ListItemModelType,
  NotificationModelType,
  StringifyObjecId,
} from "@type/models";
import { PushNotificationType } from "@type/other";
import { CinementSchemaType } from "@type/schemas";
import Ably from "ably";
import {
  v2 as cloudinary
} from "cloudinary";
import { randomInt } from "crypto";
import { ClientSession } from "mongoose";
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

type MediaUploaderOptions = {
  allOrNone: boolean
}

type MediaUploaderResponse = {
  success: true,
  result: { file_name: string, url: string }[]
} | {
  success: false,
  error: string,
}

type ExtUploadResponse = {
  success: true,
  response: ({
    success: false;
    file_name: string;
    error: string;
    url: undefined;
  } | {
    success: true;
    url: string;
    file_name: string;
    error: undefined;
  })[]
} | {
  success: false,
  error: string,
}

export const mediaUploader = async (files: File | File[], options?: MediaUploaderOptions): Promise<MediaUploaderResponse> => {

  const filesToUpload = Array.isArray(files) ? files : [files]

  const response: ExtUploadResponse = await fetch(
    `https://testlalaapp.vercel.app/api/media`,
    {
      method: "POST",
      body: objectToFormData({
        file: filesToUpload
      }),
    }).then(r => r.json());

  if (!response.success)
    return { success: false, error: response.error }

  const uploadedFiles = response.response.filter(el => el.success);

  const fails = filesToUpload.length - uploadedFiles.length;

  if (options?.allOrNone && fails !== 0)
    return { success: false, error: `${fails} file(s) could not be uploaded correctly.` }

  return {
    success: true,
    result: uploadedFiles.map(f => ({ file_name: f.file_name, url: f.url }))
  }

}

// export const mediaUploader = async (
//   file: File,
//   options?: UploadApiOptions
// ): Promise<
//   | { result: UploadApiResponse; error: string; success: true }
//   | { result: null; error: string; success: false }
// > => {
//   if (!file) return { result: null, error: "No file found.", success: false };

//   const bytes = await file.arrayBuffer();
//   const buffer = Buffer.from(bytes);
//   try {
//     const result = await new Promise<UploadApiResponse>((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(options, (err, res) => {
//         if (err || !res) reject(err);
//         else resolve(res);
//       });
//       stream.end(buffer);
//     });

//     return { result, success: true, error: "" };
//   } catch (err) {
//     console.error("Failed To Upload Media", err);
//     return {
//       result: null,
//       success: false,
//       error: "Something went wrong! Please Try again",
//     };
//   }
// };

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

// export const multipleMediaUploader = async (
//   file: File,
//   options?: UploadApiOptions
// ): Promise<
//   | { result: UploadApiResponse; error: string; success: true }
//   | { result: null; error: string; success: false }
// > => {
//   if (!file) return { result: null, error: "No file found.", success: false };

//   const bytes = await file.arrayBuffer();
//   const buffer = Buffer.from(bytes);
//   try {
//     const result = await new Promise<UploadApiResponse>((resolve, reject) => {
//       const stream = cloudinary.uploader.upload_stream(options, (err, res) => {
//         if (err || !res) reject(err);
//         else resolve(res);
//       });
//       stream.end(buffer);
//     });

//     return { result, success: true, error: "" };
//   } catch (err) {
//     console.error("Failed To Upload Media", err);
//     return {
//       result: null,
//       success: false,
//       error: "",
//     };
//   }
// };

type CinementDocType = CinementModelType & { _id: StringifyObjecId }
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
  const existingItems: CinementDocType[] = tmdbIds.length
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

  let createdItems: CinementDocType[] = [];
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

type EmailPayload = {
  code: number;
  expiresOn: number;
  triedTimes: number;
}

export const sendVerificationCode = async (
  email: string,
  fingerprint: string,
): Promise<GeneralGetReturn> => {
  if (!fingerprint) throw new Error("Fingerprint is not passed");

  const redis = await getRedis();

  const payload: EmailPayload | null = await redis
    .get(`limits:email:${fingerprint}`)
    .then(r => JSON.parse(r ?? "null"));

  if (payload && payload.triedTimes >= 5)
    return { success: false, errCode: "email_verification_limit_exceed" }

  try {
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

    const updatedPayload: EmailPayload = {
      code,
      expiresOn: getTimeInFuture({ unit: "m", timeVal: 5 }),
      triedTimes: (payload?.triedTimes ?? 0) + 1,
    };

    await redis.setex(`limits:email:${fingerprint}`, oneHour, JSON.stringify(updatedPayload));

    return { success: true, result: null };

  } catch (err: any) {
    console.log("Error occured while sending verification email", err.message);
    return { success: false, errCode: "unknown_error" };
  }
};

export const verifyCode = async (code: string | number, fingerprint: string): Promise<GeneralPostReturn> => {
  try {

    const { success, data, error } = verificationCodeSchema.safeParse(code);

    if (!success)
      return { success: false, errCode: "form_error", formError: error.errors }

    const redis = await getRedis();

    const payload: EmailPayload | null = await redis
      .get(`limits:email:${fingerprint}`)
      .then(r => JSON.parse(r ?? "null"));

    if (!payload || payload.expiresOn < Date.now())
      return { success: false, errCode: "verification_code_expired" }

    else if (payload.code !== data.code)
      return { success: false, errCode: "invalid_verification_code" }

    return { success: true, result: null }

  } catch (err: any) {
    console.error("Failed to compare codes", err.message);
    return { success: false, errCode: "unknown_error" };
  }
};

export const sendNotification = async (
  notifications: NotificationModelType[],
  session?: ClientSession
) => {
  const createdNotifications: (NotificationModelType & { _id: StringifyObjecId })[] =
    await Notifications.create(notifications, {
      session,
    });

  const ably = new Ably.Rest(process.env.ABLY_API_KEY!);
  await Promise.all(
    createdNotifications.map(async (n) => {
      const channel = ably.channels.get(n.user_id as string);
      if ((await channel.presence.get()).items.length) {
        return channel.publish("notification", n);
      } else {
        return ably.push.admin.publish(
          {
            clientId: n.user_id,
          },
          {
            title: n.title,
            data: { path: n.path ?? "/notifications" },
            body: "Click here to open",
          } as PushNotificationType
        );
      }
    })
  );
};
