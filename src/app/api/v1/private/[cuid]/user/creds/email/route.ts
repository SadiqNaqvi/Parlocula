import { getSession, storeSession } from "@lib/auth";
import { updateRequest } from "@lib/helpers/common";
import { usernameUpdateSchema } from "@lib/schemas";
import { getTimeInFuture } from "@lib/utils";
import { User } from "@model";
import * as bcrypt from "bcrypt";
import { cookies } from "next/headers";

type Data = {
  email: string;
  passkey: string;
  code: string;
  encrypted: string;
};

export const PATCH = updateRequest({
  handler: async ({ data, user_id, username }) => {
    const { passkey, code, encrypted, email } = data as Data;

    if (!bcrypt.compareSync(code, encrypted))
      return { success: false, errCode: "pp212" };
    else if (!passkey)
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
      { passkey: 1, emailUpdatedAt: 1 }
    );

    if (!user) return { success: false, errCode: "pp202" };
    else if (
      user.emailUpdatedAt &&
      getTimeInFuture({ unit: "mo", from: user.emailUpdatedAt }) > Date.now()
    )
      return { success: false, errCode: "pp211" };

    if (!bcrypt.compareSync(passkey, user.passkey))
      return { success: false, errCode: "pp210" };

    const cookieStore = cookies();
    const sid = cookieStore.get("sid")?.value ?? "";
    const { result, success } = await getSession(sid);
    if (!success || !result) return { success: false, errCode: "pp100" };

    if (!(await storeSession(sid, { ...result, email })))
      return {
        success: false,
        errCode: "pp100",
      };

    const stored = await User.findByIdAndUpdate(user_id, {
      $set: { email, emailUpdatedAt: new Date() },
    });

    if (!stored) {
      await storeSession(sid, result);
      return { success: false, errCode: "pp100" };
    }

    return {
      success: true,
      available: "userEmailMutation_uid_oldEmail_newEmail",
      options: { oldEmail: result.email, newEmail: email, uid: user_id },
      result: stored,
    };
  },
  schema: usernameUpdateSchema,
});
