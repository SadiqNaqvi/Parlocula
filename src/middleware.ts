export const config = {
  matcher: ["/api/v1/user/me", "/api/v1/private/:path*"],
};

import { getSession } from "@lib/auth";
import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";

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

const validateUser = async (rq: NextRequest, rs: NextResponse) => {
  const token = rq.cookies.get("token")?.value;
  const session_id = rq.cookies.get("sid")?.value;
  if (!token || !session_id) return false;

  const payload = await verifyToken(token);
  console.log(payload);
  if (!payload || !payload.exp) return false;

  const cuid = rq.nextUrl.pathname.slice(16).split("/")[0];
  if (payload.user_id === cuid && payload.exp > Date.now()) return true;

  const session = await getSession(session_id);
  if (!session || session.user_id !== cuid) return false;

  const newToken = await generateToken({ user_id: session.user_id });
  rs.cookies.set("token", newToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
  return true;
};

export const middleware = async (req: NextRequest) => {
  // console.log("middleware entered");
  const { url } = req;

  const response = NextResponse.next();

  // Check if there's a current user
  const user = await validateUser(req, response);
  // const user = true;

  // If user is trying to post something but there's no current user, return the request.
  if (url.includes("/api/v1/private")) {
    if (!user)
      return NextResponse.json({
        result: null,
        errCode: "pp202",
        success: false,
      });
    // else if (user.isBanned)
    //   return NextResponse.json({
    //     result: null,
    //     success: false,
    //     errCode: "pp206",
    //   });
  }

  // If user is trying to fetch their details in /user/me page but there's no current user, return the request.
  else if (url.includes("/api/v1/user/me") && !user)
    return NextResponse.json({
      result: null,
      errCode: "pp202",
      success: false,
    });

  return response;
};
