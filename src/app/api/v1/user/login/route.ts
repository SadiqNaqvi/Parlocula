import { postRequest } from "@lib/actions/actions";
import { storeSession } from "@lib/auth/session";
import { emailSchema } from "@lib/schemas";
import User from "@model/users";
import { cookies } from "next/headers";

export const POST = postRequest({
  handler: async ({ data, session }) => {
    const { email } = data;
    const parsed = emailSchema.safeParse(email);

    if (parsed.error) return { success: false, errCode: "pp500" };

    const user = await User.findOne(
      { email },
      { password: 0, genres: 0, session_id: 0 }
    );

    const session_id = crypto.randomUUID();

    await User.findByIdAndUpdate(
      user._id,
      {
        lastLoginAt: new Date(),
        session_id,
      },
      { session }
    );

    if (!user) return { success: false, errCode: "pp204" };

    const { _id, username, isBanned } = user;

    const id = _id.toString();

    const isSession = await storeSession(session_id, {
      user_id: id,
      username,
      email,
      isBanned: isBanned,
    });

    if (!isSession) return { success: false, errCode: "pp100" };

    cookies().set("sid", session_id, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    return {
      result: user,
      success: true,
      errCode: null,
      available: "login_uid",
      options: { uid: id },
    };
  },
});
