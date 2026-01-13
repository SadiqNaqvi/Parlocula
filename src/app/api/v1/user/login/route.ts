import { generateToken } from "@lib/auth";
import { deleteSession, storeSession } from "@lib/auth/session";
import { postHandler } from "@lib/helpers/handlers";
import { storeUserMetaInCache } from "@lib/helpers/redis/messaging";
import { verifyCode } from "@lib/helpers/server";
import { currentUserPipeline } from "@lib/pipelines";
import { emailSchema } from "@lib/schemas";
import User from "@model/users";
import { MereShelf, TokenPayload } from "@type/internal";
import { UserModelType } from "@type/models";
import { ErrorCodes } from "@type/other";
import { ClientSession } from "mongoose";
import { cookies } from "next/headers";

type ResponseType = Omit<Required<UserModelType>, "isActive" | "lastLoginAt" | "password" | "session_id"> & { predefinedShelves: MereShelf }

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
      deletionId: undefined,
    },
    { session }
  );

  if (!oldDoc) return null;

  if (oldDoc.session_id) deleteSession(oldDoc.session_id);

  const { _id, username, isBanned, email, banEndsAt, profile, filterContent, dob } = user;

  const id = _id.toString();

  const tokenPayload: TokenPayload & { email: string } = {
    user_id: id,
    username,
    email,
    isBanned,
    banEndsAt,
    profile,
    filterContent,
    dob,
  }

  const isStored = await storeSession(session_id, tokenPayload);

  if (!isStored)
    return "session_store_fail";

  const token = await generateToken(tokenPayload);

  (await cookies()).set("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  (await cookies()).set("sid", session_id, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

};

export const POST = postHandler<{ email: string, code: string, fingerprint: string }>({
  handler: async ({ data, session }) => {

    const { email, code, fingerprint } = data;
    const parsedEmail = emailSchema.safeParse(email);

    if (parsedEmail.error)
      return { success: false, errCode: "invalid_input" };

    const resp = await verifyCode(code, fingerprint);
    if (!resp.success) return resp;

    const results = await User.aggregate(currentUserPipeline({ email }));

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
  skipUserCheck: true,
});
