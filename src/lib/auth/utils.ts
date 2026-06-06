"use server";

import { TokenPayload } from "@type/internal";
import { CookiesType } from "@type/other";
import { verifyToken } from "./token";

export const getUserFromToken = async (jar: CookiesType): Promise<TokenPayload | null> => {

  const token = jar.get("token")?.value;

  if (!token) return null;

  const payload = await verifyToken(token);

  if (!payload || typeof payload === "string" || !payload.user_id)
    return null;

  else if (payload.exp && (payload.exp * 1000) < Date.now())
    return null

  return payload;
};
