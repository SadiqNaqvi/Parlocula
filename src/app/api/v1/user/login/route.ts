import { generateToken } from "@lib/auth";
import { deleteSession, storeSession } from "@lib/auth/session";
import { postRequest } from "@lib/helpers/common";
import { currentUserPipeline } from "@lib/pipelines";
import { emailSchema } from "@lib/schemas";
import User from "@model/users";
import { User as UserType } from "@type/internal";
import { ClientSession } from "mongoose";
import { cookies } from "next/headers";

type ResponseType = UserType & {
  isBanned: boolean;
  banEndsAt: Date | null;
};

const sessionManagement = async (
  user: ResponseType,
  session: ClientSession
) => {
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

  console.log(oldDoc);

  if (oldDoc.session_id) deleteSession(oldDoc.session_id);

  const { _id, username, isBanned, email, banEndsAt } = user;

  const id = _id.toString();

  const isStored = await storeSession(session_id, {
    user_id: id,
    username,
    email,
    isBanned,
    banEndsAt,
  });
  if (!isStored) return { success: false as false, errCode: "pp100" };

  const token = await generateToken({
    user_id: id,
    username,
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

export const POST = postRequest({
  handler: async ({ data, session }) => {
    const { email } = data;
    const parsed = emailSchema.safeParse(email);
    if (parsed.error) return { success: false, errCode: "pp500" };

    const results = await User.aggregate(currentUserPipeline({ email }), {
      session,
    });

    const user: ResponseType = results[0];

    if (!user) return { success: false, errCode: "pp204" };

    const error = await sessionManagement(user, session);
    if (error) return error;

    return {
      result: user,
      success: true,
      errCode: null,
      available: "login_uid",
      options: { uid: user._id },
    };
  },
});
