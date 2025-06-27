import { JWTPayload, SignJWT, jwtVerify } from "jose";

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

type ReturnType<T> = T extends undefined
  ? { user_id: string; username: string }
  : T;

export const verifyToken = async <T = undefined>(
  token: string
): Promise<(JWTPayload & ReturnType<T>) | null> => {
  if (!token) return null;
  const secret = getEncryptionKey();

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as JWTPayload & ReturnType<T>;
  } catch (err: any) {
    console.error("Error verifying token:", err.message);
    if (err.message.includes(`"exp" claim timestamp check failed`))
      return err.payload;
    return null;
  }
};
