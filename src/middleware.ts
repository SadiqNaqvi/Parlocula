export const config = {
  matcher: ["/api/v1/private/:path*"],
};

import { generateToken, getSession, verifyToken } from "@lib/auth";
import { deleteUserFromCookies } from "@lib/auth/utils";
import { NextRequest, NextResponse } from "next/server";

const validateUser = async (
  rq: NextRequest,
  rs: NextResponse
): Promise<
  { success: true } | { success: false; errCode: string; status?: number }
> => {
  const jar = rq.cookies;
  const token = jar.get("token")?.value;
  const session_id = jar.get("sid")?.value;

  if (!token || !session_id)
    return { success: false, errCode: "unauthenticated_access", status: 404 };

  const payload = await verifyToken(token);
  const cuid = rq.nextUrl.pathname.split("/private")[1].split("/")[1];
  if (!payload || payload.user_id !== cuid)
    return { success: false, errCode: "unauthenticated_access" };
  else if (payload.exp && payload.exp > Date.now()) return { success: true };

  const { result, success } = await getSession(session_id);
  if (!success) return { success: false, errCode: "unknown_error" };
  else if (!result) {
    deleteUserFromCookies(rq.cookies);
    return { success: false, errCode: "unauthenticated_access" };
  }

  const newToken = await generateToken({
    user_id: result.user_id,
    username: result.username,
    profile: result.profile,
  });

  rs.cookies.set("token", newToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  return { success: true };
};

export const middleware = async (req: NextRequest) => {
  console.log("middleware entered");
  const { url } = req;

  const response = NextResponse.next();

  // Check if there's a current user
  const user = await validateUser(req, response);

  if (
    req.method === "GET" &&
    (url.includes("/list") || url.includes("/item"))
  ) {
    if (!user.success && user.status === 404) return response;
    else return NextResponse.json(user, { status: 403 });
  }

  // If user is trying to post something but there's no current user, return the request.
  if (url.includes("/api/v1/private")) {
    if (!user.success) return NextResponse.json(user, { status: 403 });
    // else if (user.isBanned)
    //   return NextResponse.json({
    //     result: null,
    //     success: false,
    //     errCode: "temporary_banned",
    //   });
  }

  // If user is trying to fetch their details in /user/me page but there's no current user, return the request.
  else if (url.includes("/api/v1/user/me") && !user.success)
    return NextResponse.json(user, { status: 403 });

  console.log("Middleware exit with user:", user.success);
  return response;
};
