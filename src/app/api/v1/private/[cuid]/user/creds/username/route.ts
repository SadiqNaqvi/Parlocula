import { generateToken, getSession, storeSession } from "@lib/auth";
import { updateHandler } from "@lib/helpers/handlers";
import { usernameUpdateSchema } from "@lib/schemas";
import { getTimeInFuture } from "@lib/utils";
import { User } from "@model";
import { UsernameUpdateSchemaType } from "@type/schemas";
import * as bcrypt from "bcrypt";
import { cookies } from "next/headers";

export const PATCH = updateHandler<UsernameUpdateSchemaType>({
  handler: async ({ data, user_id, username, session }) => {
    const { passkey } = data;
    const newUsername = data.username;

    const usernameExists = await User.exists({ username });

    if (Boolean(usernameExists)) return {
      success: false,
      errCode: "form_error",
      formErrors: [{
        path: "username", message: "Username not available"
      }],
    };

    const user = await User.findById(user_id, { passkey: 1, usernameUpdatedAt: 1 });

    if (!user)
      return { success: false, errCode: "unauthenticated_access" };

    else if (
      user.usernameUpdatedAt &&
      getTimeInFuture({ unit: "mo", from: user.usernameUpdatedAt }) > Date.now()
    )
      return { success: false, errCode: "early_identification_update" };

    const isCorrect = bcrypt.compareSync(passkey, user.passkey);
    if (!isCorrect)
      return { success: false, errCode: "wrong_passkey" };

    const cookieStore = await cookies();

    const sid = cookieStore.get("sid")?.value ?? "";

    const { result, success } = await getSession(sid);
    if (!success || !result)
      return { success: false, errCode: "unknown_error" };

    const stored = await User.findByIdAndUpdate(
      user_id,
      {
        $set: { username: newUsername, usernameUpdatedAt: new Date() },
      },
      { session }
    );

    if (!stored)
      return { success: false, errCode: "data_storing_fail" }

    const sessionStored = await storeSession(sid, { ...result, username: newUsername });

    if (!sessionStored)
      return { success: false, errCode: "session_store_fail" }

    const { email, expireOn, ...tokenPayload } = result;

    cookieStore.set("token", await generateToken({ ...tokenPayload, username: newUsername }), {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
    });

    return {
      success: true,
      available: "userUsernameMutation_uid_oldUsername_newUsername",
      options: { oldUsername: username, newUsername, uid: user_id },
      result: stored,
    };
  },
  schema: usernameUpdateSchema,
});
