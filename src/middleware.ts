export const config = {
  matcher: ["/api/v1/user/me", "/api/v1/private/:path*"],
};

import { generateToken, getSession, verifyToken } from "@lib/auth";
import { NextRequest, NextResponse } from "next/server";

const validateUser = async (
  rq: NextRequest,
  rs: NextResponse
): Promise<{ success: true } | { success: false; errCode: string }> => {
  const cookieStore = rq.cookies;
  const token = cookieStore.get("token")?.value;
  const session_id = cookieStore.get("sid")?.value;


  if (!token || !session_id) return { success: false, errCode: "pp202" };

  const payload = await verifyToken(token);
  if (!payload || !payload.exp) return { success: false, errCode: "pp202" };

  const cuid = rq.nextUrl.pathname.slice(16).split("/")[0];
  if (payload.user_id !== cuid) return { success: false, errCode: "pp202" };
  else if (payload.exp > Date.now()) return { success: true };

  const sessionResponse = await getSession(session_id);
  if (!sessionResponse.success) return { success: false, errCode: "pp100" };

  const session = sessionResponse.result;
  if (!session || session.user_id !== cuid) {
    rs.cookies.delete("sid");
    rs.cookies.delete("token");
    return { success: false, errCode: "pp202" };
  }

  const newToken = await generateToken({
    user_id: session.user_id,
    username: session.username,
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
  // console.log("middleware entered");
  const { url } = req;

  const response = NextResponse.next();

  // Check if there's a current user
  const user = await validateUser(req, response);

  // If user is trying to post something but there's no current user, return the request.
  if (url.includes("/api/v1/private")) {
    if (!user.success) return NextResponse.json(user, { status: 403 });
    // else if (user.isBanned)
    //   return NextResponse.json({
    //     result: null,
    //     success: false,
    //     errCode: "pp206",
    //   });
  }

  // If user is trying to fetch their details in /user/me page but there's no current user, return the request.
  else if (url.includes("/api/v1/user/me") && !user.success)
    return NextResponse.json(user, { status: 403 });

  return response;
};
