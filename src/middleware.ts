import { generateToken, getSession, verifyToken } from "@lib/auth";
import { isValidObjectId } from "mongoose";
import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

const checkTokenAndSession = async () => {
  const token = cookies().get("token");
  if (!token || !token.value) return false;
  const payload = verifyToken(token.value);
  if (
    typeof payload === "string" ||
    !payload.exp ||
    !payload.user_id ||
    !isValidObjectId(payload.user_id)
  )
    return false;

  if (payload.exp * 1000 > Date.now()) return true;
  const session = await getSession(payload.user_id);
  if (!session) return false;

  generateToken({
    user_id: payload.user_id,
    dob: payload.dob,
  });
  return true;
};

export const middleware = async (req: NextRequest) => {
  req.headers.forEach((header) => console.log(header));

  const response = await checkTokenAndSession();
  if (req.url.includes("/api/private") && !response)
    return NextResponse.redirect(new URL("/join", req.url));
  else if (req.url.includes("/api/user") && !response)
    return NextResponse.json({
      result: null,
      error: "No Logged in user",
      success: true,
    });

  return NextResponse.next();
};

export const config = {
  matcher: ["/api/user", "/api/private/:path*"],
};
