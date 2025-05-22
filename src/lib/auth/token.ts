import { isValidObjectId } from "@lib/utils";
import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { NextRequest } from "next/server";

export function getEncryptionKey(): Uint8Array {
  const secret = process.env.JWT_SECRET!;
  return new Uint8Array(Buffer.from(secret, "hex"));
}

export const generateToken = async (details: any) => {
  const secret = getEncryptionKey();
  return await new SignJWT(details)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret);
};

export const verifyToken = async (token: string) => {
  if (!token) return null;
  const secret = getEncryptionKey();

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as JWTPayload & { user_id: string; username: string };
  } catch (err: any) {
    console.error("Error verifying token:", err.message);
    if (err.message.includes(`"exp" claim timestamp check failed`))
      return err.payload;
    return null;
  }
};

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
