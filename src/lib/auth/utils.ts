import { isValidObjectId } from "@lib/utils";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { verifyToken } from "./token";

export const getUserFromToken = async (
  cookieStore: RequestCookies | ReadonlyRequestCookies
): Promise<{ user_id: string; username: string } | null> => {
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (
    !payload ||
    typeof payload === "string" ||
    !payload.user_id ||
    !isValidObjectId(payload.user_id)
  )
    return null;
  return payload;
};