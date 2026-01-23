"use server";

import { TokenPayload } from "@type/internal";
import { CookiesType } from "@type/other";
import { cookies } from "next/headers";
import { getSession } from "./session";
import { verifyToken } from "./token";

// export const deleteUserFromCookies = async () => {
//   const jar = await cookies();
//   jar.delete("sid");
//   jar.delete("token");
// };

// const checkSessionAndRefreshUser = async (jar: CookiesType): Promise<TokenPayload | null | undefined> => {
//   const session_id = jar.get("sid")?.value;
//   if (!session_id) return null;

//   const { result, success } = await getSession(session_id);

//   // Return undefined if session cant be fetched because of network issue.
//   if (!success) return undefined;
//   // Return null if session does not exists.
//   else if (!result) {
//     deleteUserFromCookies();
//     return null;
//   }

//   const { expireOn, ...rest } = result;
//   return rest;
// };

export const getUserFromToken = async (
  jar: CookiesType
): Promise<TokenPayload | null> => {

  const token = jar.get("token")?.value;

  if (!token) return null;

  const payload = await verifyToken(token);

  if (!payload || typeof payload === "string" || !payload.user_id)
    return null;

  else if (payload.exp && payload.exp < Date.now())
    return null

  return payload;
};
