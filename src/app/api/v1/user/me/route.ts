import { getRequest } from "@lib/actions/actions";
import { getCurrentUser } from "@lib/actions/serverActions";
import { User } from "@model";

export const GET = getRequest(async (r: any) => {
  const payload = await getCurrentUser(r);
  if (!payload)
    return {
      result: null,
      success: true,
      errCode: null,
    };

  const user = await User.findById(payload.user_id, {
    password: 0,
    genres: 0,
    session_id: 0,
  }).exec();

  return { result: user, success: true, errCode: null };
});
