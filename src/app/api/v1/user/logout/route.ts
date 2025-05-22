import { deleteSession } from "@lib/auth";
import { deleteRequest } from "@lib/helpers/common";
import { User } from "@model";
import { cookies } from "next/headers";

export const DELETE = deleteRequest(async () => {
  const cookieStore = cookies();
  const session_id = cookieStore.get("sid")?.value;
  if (!session_id) return { success: false, errCode: "pp500" };

  const user = await User.findOneAndUpdate(
    { session_id },
    { $set: { session_id: null } }
  );
  await deleteSession(session_id);

  cookieStore.delete("sid");
  cookieStore.delete("token");

  return {
    result: null,
    success: true,
    available: "loginLogout_uid",
    options: { uid: user._id },
    files: [],
  };
});
