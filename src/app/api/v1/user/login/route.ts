import { generateToken } from "@lib/auth";
import { deleteSession, storeSession } from "@lib/auth/session";
import { postRequest } from "@lib/helpers/common";
import { storeUserMetaInCache } from "@lib/helpers/redis";
import { verifyCode } from "@lib/helpers/server";
import { currentUserPipeline } from "@lib/pipelines";
import { emailSchema } from "@lib/schemas";
import User from "@model/users";
import { User as UserType } from "@type/internal";
import { ErrorCodes } from "@type/other";
import { ClientSession } from "mongoose";
import { cookies } from "next/headers";

type ResponseType = UserType & {
  isBanned: boolean;
  banEndsAt: Date | undefined;
};

const sessionManagement = async (
  user: ResponseType,
  session: ClientSession
): Promise<ErrorCodes | null | undefined> => {
  const session_id = crypto.randomUUID();

  const oldDoc = await User.findByIdAndUpdate(
    user._id,
    {
      lastLoginAt: new Date(),
      session_id,
      isActive: true,
    },
    { session }
  );

  if (!oldDoc) return null;

  if (oldDoc.session_id) deleteSession(oldDoc.session_id);

  const { _id, username, isBanned, email, banEndsAt, profile } = user;

  const id = _id.toString();

  const isStored = await storeSession(session_id, {
    user_id: id,
    username,
    email,
    isBanned,
    banEndsAt,
    profile,
  });

  if (!isStored)
    return "session_store_fail";

  const token = await generateToken({
    user_id: id,
    username,
    profile,
  });

  cookies().set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  cookies().set("sid", session_id, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

};

export const POST = postRequest<{ email: string, code: string }>({
  handler: async ({ data, session }) => {

    const did = cookies().get("did")?.value;
    if (!did) return { success: false, errCode: "missing_device_fingerprint" }

    const { email, code } = data;
    const parsedEmail = emailSchema.safeParse(email);

    if (parsedEmail.error)
      return { success: false, errCode: "invalid_input" };

    const resp = await verifyCode(code, did);
    if (!resp.success) return resp;

    const results = await User.aggregate(
      currentUserPipeline({ email }), { session }
    );

    const user: ResponseType = results[0];

    if (!user) return { success: false, errCode: "unregistered_user" };

    await storeUserMetaInCache({ _id: user._id, username: user.username, profile: user.profile })

    const error = await sessionManagement(user, session);
    if (error) return { success: false, errCode: error };


    const { isBanned, banEndsAt, ...result } = user;

    return {
      result,
      success: true,
      available: "loginLogout_uid",
      options: { uid: user._id },
    };
  },
});
