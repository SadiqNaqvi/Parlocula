import { CookiesType } from "@type/other";
import { getSession } from "./session";
import { verifyToken } from "./token";
import { UserMetaData } from "@store/user";

export const deleteUserFromCookies = (jar: CookiesType) => {
  jar.delete("sid");
  jar.delete("token");
};

const checkSessionAndRefreshUser = async (jar: CookiesType) => {
  const session_id = jar.get("sid")?.value;
  if (!session_id) return null;

  const { result, success } = await getSession(session_id);

  // Return undefined if session cant be fetched because of network issue.
  if (!success) return undefined;
  // Return null if session does not exists.
  else if (!result) {
    deleteUserFromCookies(jar);
    return null;
  }

  const { user_id, username, profile } = result;
  return { user_id, username, profile };
};

export const getUserFromToken = async (
  jar: CookiesType
): Promise<UserMetaData | null | undefined> => {

  const token = jar.get("token")?.value;

  if (!token) return null;

  const payload = await verifyToken(token);

  if (!payload || typeof payload === "string" || !payload.user_id) return null;

  else if (payload.exp && payload.exp < Date.now())
    return await checkSessionAndRefreshUser(jar);

  return payload;
};
