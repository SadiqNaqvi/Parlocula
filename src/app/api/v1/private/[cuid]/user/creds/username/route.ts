import { oneWeek } from "@lib/constants";
import { updateRequest } from "@lib/helpers/common";
import { usernameUpdateSchema } from "@lib/schemas";
import { getTimeInFuture } from "@lib/utils";
import { User } from "@model";
import { unstable_cache } from "next/cache";
import * as bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { generateToken, getSession, storeSession } from "@lib/auth";

export const PATCH = updateRequest({
  handler: async ({ data, user_id, username }) => {
    const { passkey } = data;
    const newUsername = data.username;

    const isUsernameAvailable = await unstable_cache(
      async () => await User.exists({ username: newUsername }),
      [],
      {
        revalidate: oneWeek,
        tags: [`isUsernameAvailable-${newUsername}`],
      }
    )();

    if (Boolean(isUsernameAvailable))
      return {
        success: false,
        errCode: "pp203",
        formErrors: [{ path: "username", message: "Username not available" }],
      };

    if (!passkey)
      return {
        success: false,
        errCode: "pp203",
        formErrors: [
          {
            path: "passkey",
            message: "Passkey is required to update username",
          },
        ],
      };

    const user = await User.findOne(
      { _id: user_id },
      { passkey: 1, usernameUpdatedAt: 1 }
    );

    if (!user) return { success: false, errCode: "pp202" };
    else if (
      user.usernameUpdatedAt &&
      getTimeInFuture({ unit: "mo", from: user.usernameUpdatedAt }) > Date.now()
    )
      return { success: false, errCode: "pp211" };

    const isCorrect = bcrypt.compareSync(passkey, user.passkey);
    if (!isCorrect) return { success: false, errCode: "pp210" };

    const cookieStore = cookies();
    const sid = cookieStore.get("sid")?.value ?? "";
    const { result, success } = await getSession(sid);
    if (!success) return { success: false, errCode: "pp100" };

    if (!(await storeSession(sid, { ...result, username: newUsername })))
      return {
        success: false,
        errCode: "pp100",
      };

    cookieStore.set(
      "token",
      await generateToken({ user_id, username: newUsername })
    );

    const stored = await User.findByIdAndUpdate(user_id, {
      $set: { username: newUsername, usernameUpdatedAt: new Date() },
    });

    if (!stored) {
      await storeSession(sid, result);
      cookieStore.set("token", await generateToken({ user_id, username }));
      return { success: false, errCode: "pp100" };
    }

    return {
      success: true,
      available: "userUsernameMutation_uid_oldUsername_newUsername",
      options: { oldUsername: username, newUsername, uid: user_id },
      result: stored,
    };
  },
  schema: usernameUpdateSchema,
});
