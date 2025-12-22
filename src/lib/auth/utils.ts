import { deleteUserFromCookies } from "@lib/helpers/server";
import { TokenPayload } from "@type/internal";
import { CookiesType } from "@type/other";
import { getSession } from "./session";
import { verifyToken } from "./token";

const checkSessionAndRefreshUser = async (jar: CookiesType): Promise<TokenPayload | null | undefined> => {
  const session_id = jar.get("sid")?.value;
  if (!session_id) return null;

  const { result, success } = await getSession(session_id);

  // Return undefined if session cant be fetched because of network issue.
  if (!success) return undefined;
  // Return null if session does not exists.
  else if (!result) {
    deleteUserFromCookies();
    return null;
  }

  const { expireOn, ...rest } = result;
  return rest;
};

export const getUserFromToken = async (
  jar: CookiesType
): Promise<TokenPayload | null> => {

  const token = jar.get("token")?.value;

  if (!token) return null;

  const payload = await verifyToken(token);

  if (!payload || typeof payload === "string" || !payload.user_id) return null;

  else if (payload.exp && payload.exp < Date.now()) {
    const response = await checkSessionAndRefreshUser(jar);

    // This will only happen when session couldn't get fetched (possibly because of network issue).
    if (response === undefined) return payload;
    else return response;
  }
  return payload;
};
