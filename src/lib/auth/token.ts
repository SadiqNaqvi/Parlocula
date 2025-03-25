import { isValidObjectId } from "@lib/utils";
import { EncryptJWT, JWTPayload, decodeJwt } from "jose";
import { RequestCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";

export function getEncryptionKey(): Uint8Array {
  const secret = process.env.JWT_SECRET!;
  return new Uint8Array(Buffer.from(secret, "hex"));
}

export const generateToken = async (details: any) => {
  const secret = getEncryptionKey();
  return await new EncryptJWT(details)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .encrypt(secret);
};

export const verifyToken = (token: string) => {
  if (!token) return null;
  try {
    return decodeJwt(token) as JWTPayload & { user_id: string };
  } catch (err) {
    console.log("Error verifying token:", err);
    return null;
  }
};

export const getPayloadFromToken = (
  r: NextRequest
):
  | (JWTPayload & {
      user_id: string;
    })
  | null => {
  const token = r.cookies.get("token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (
    !payload ||
    typeof payload === "string" ||
    !payload.user_id ||
    !isValidObjectId(payload.user_id)
  )
    return null;
  return payload as JWTPayload & { user_id: string };
};
