"use server";

import VerifyEmail from "@components/EmailTemplates/verification";
import { oneHour } from "@lib/constants";
import { getRedis } from "@lib/providers/redis";
import { verificationCodeSchema } from "@lib/schemas";
import { getTimeInFuture } from "@lib/utils";
import { Cinement, Notification, ShelfItem } from "@model";
import { render } from "@react-email/components";
import { GeneralGetReturn, GeneralPostReturn } from "@type/internal";
import { CinementModelType, NotificationModelType, ShelfItemModelType } from "@type/models";
import { PushNotificationType } from "@type/other";
import { CinementSchemaType } from "@type/schemas";
import Ably from "ably";
import { randomInt } from "crypto";
import { ClientSession } from "mongoose";
import { cookies } from "next/headers";
import { createTransport } from "nodemailer";

type CinementDocType = CinementModelType & { _id: string }

export const addItemsInShelf = async (
  items: CinementSchemaType[],
  shelf_type: "custom" | "favourite" | "recommended" | "watched",
  id: string,
  user_id: string,
  session: ClientSession
) => {
  if (!items || !items.length) return;

  // Step 1: Separate confirmed and unconfirmed cinements
  const confirmedItems = items.filter((item) => item.isConfirm === true);
  const unconfirmedItems = items.filter((item) => item.isConfirm === false);

  // Step 2: Find existing items for unconfirmed items
  const extIds = unconfirmedItems.map((item) => item.ext_id);
  const existingItems: CinementDocType[] = extIds.length
    ? await Cinement.find({ ext_id: { $in: extIds } })
    : [];

  // Step 3: Create missing items and get all item IDs
  const itemsToCreate = unconfirmedItems.filter(
    (item) =>
      !existingItems.some((existing) => existing.ext_id === item.ext_id)
  );

  let createdItems: CinementDocType[] = [];
  if (itemsToCreate.length > 0) {
    createdItems = await Cinement.create(
      itemsToCreate.map(
        (item) =>
          ({
            ext_id: item.ext_id,
            year: item.year,
            cinement_type: item.cinement_type,
            title: item.title,
            poster: item.poster,
            favourite: shelf_type === "favourite" ? 1 : 0,
            watched: shelf_type === "watched" ? 1 : 0,
            recommended: shelf_type === "recommended" ? 1 : 0,
          }) as CinementDocType
      ),
      { session, ordered: true }
    );
  }

  // Step 4: Create a map of tmdb_id to media_id
  const itemIdMap = new Map<string, string>();

  // Add existing and newly created items to the map
  existingItems.concat(createdItems).forEach(({ ext_id, _id }) => {
    itemIdMap.set(ext_id, _id);
  });

  //Add Confirmed items to the map
  confirmedItems.forEach(({ ext_id, cinement_id }) => {
    itemIdMap.set(ext_id, cinement_id);
  });

  // Step 5: Create shelf items
  const itemsArr: ShelfItemModelType[] = items.map((item) => ({
    shelf_id: id,
    user_id: user_id,
    cinement_id: itemIdMap.get(item.ext_id) as string,
    ext_id: item.ext_id,
    year: item.year,
    createdAt: new Date(),
  }));

  if (itemsArr.length > 0) {
    await ShelfItem.create(itemsArr, { session, ordered: true });
  }
};

type EmailPayload = {
  code: number;
  expiresOn: number;
  triedTimes: number;
}

type SendEmailProps = {
  template: string;
  email: string;
  subject: string;
}

const transportor = createTransport({
  service: "gmail",
  auth: {
    user: process.env.QCORE_EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});

export const sendEmail = async ({ email, subject, template }: SendEmailProps) => {
  await transportor.sendMail({
    from: process.env.QCORE_EMAIL,
    to: email,
    subject,
    html: template,
  });
}

export const sendVerificationCode = async (
  email: string,
  fingerprint: string,
): Promise<GeneralGetReturn> => {
  if (!fingerprint) throw new Error("Fingerprint is not passed");

  if (!!process.env.IS_TESTING) return {
    success: true,
    result: null,
  }

  const redis = await getRedis();

  const payload: EmailPayload | null = await redis
    .get(`limits:email:${fingerprint}`)
    .then(r => JSON.parse(r ?? "null"));

  if (payload && payload.triedTimes >= 5)
    return { success: false, errCode: "email_verification_limit_exceed" }

  try {

    const code = randomInt(100000, 1000000);

    const template = await render(VerifyEmail({ code }));

    await sendEmail({ email, template, subject: "Email Verification" });

    const triedTimes = payload?.triedTimes ?? 0;
    const updatedPayload: EmailPayload = {
      code,
      expiresOn: getTimeInFuture({ unit: "m", timeVal: 5 }),
      triedTimes: triedTimes + 1,
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

    const { success, data, error } = verificationCodeSchema.safeParse(`${code}`);

    if (!success)
      return { success: false, errCode: "form_error", formError: error.errors }

    if (!!process.env.IS_TESTING) {
      if (data === 123456) return {
        success: true,
        result: null
      }
      else return {
        success: false,
        errCode: "invalid_verification_code"
      }
    }

    const redis = await getRedis();

    const payload: EmailPayload | null = await redis
      .get(`limits:email:${fingerprint}`)
      .then(r => JSON.parse(r ?? "null"));

    if (!payload || payload.expiresOn < Date.now())
      return { success: false, errCode: "verification_code_expired" }

    else if (payload.code !== data)
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
  const createdNotifications = await Notification.create(notifications, { session });

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

export const deleteUserFromCookies = async () => {
  const jar = await cookies();
  jar.delete("sid");
  jar.delete("token");
};