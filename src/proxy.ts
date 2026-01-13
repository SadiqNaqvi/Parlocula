import { generateToken, getSession, verifyToken } from "@lib/auth";
import { slidingWindowRateLimit } from "@lib/helpers/redis/rate_limiting";
import { ErrorCodes } from "@type/other";
import { NextRequest, NextResponse } from "next/server";

const getUidAndPath = (req: NextRequest) => {
  const { pathname } = req.nextUrl;
  const paths = pathname.split("/private/")[1]?.split("/");
  if (!paths) throw new Error(`Inavlid pathname in URL! ${pathname}`);

  const [uid, ...rest] = paths;

  return {
    user_id: uid,
    path: rest.join('/')
  }
}

const validateUser = async (
  rq: NextRequest,
  rs: NextResponse
): Promise<
  { success: true, user_id: string } | { success: false; errCode: ErrorCodes; reason?: "noTokenORSession" | "banned" }
> => {
  const jar = rq.cookies;
  const token = jar.get("token")?.value;
  const session_id = jar.get("sid")?.value;

  if (!token || !session_id)
    return { success: false, errCode: "unauthenticated_access", reason: "noTokenORSession" };

  const payload = await verifyToken(token);

  const { user_id } = getUidAndPath(rq);

  if (!payload || payload.user_id !== user_id)
    return { success: false, errCode: "unauthenticated_access" };

  else if (payload.exp && payload.exp > Date.now()) return { success: true, user_id };

  const { result, success } = await getSession(session_id);

  if (!success) return { success: false, errCode: "unknown_error" };

  else if (!result) {
    rq.cookies.delete("token");
    rq.cookies.delete("sid");
    return { success: false, errCode: "unauthenticated_access" };
  }

  const { email, expireOn, ...tokenPayload } = result;

  const newToken = await generateToken(tokenPayload);

  rs.cookies.set("token", newToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  if (result.isBanned && result.banEndsAt && new Date(result.banEndsAt).getTime() > Date.now())
    return { success: false, errCode: "temporary_banned" }

  return { success: true, user_id };
};

export const proxy = async (req: NextRequest) => {
  console.log("middleware entered");
  const { pathname } = req.nextUrl;

  const response = NextResponse.next();

  // Check if there's a current user
  const user = await validateUser(req, response);

  console.log("is User in Middleware:", user.success);

  if (!user.success) {

    // User is trying to get a shelf or shelf items. User could be guest.
    if (req.method === "GET" && (pathname.includes("/shelf") || pathname.includes("/item")) && user.reason === "noTokenORSession")
      return response;

    return NextResponse.json(user, { status: 403 });
  }

  // const cooldownState = await checkCooldownState(user.user_id);

  // if (cooldownState) {
  //   return NextResponse.json({
  //     success: false,
  //     errCode: "rate_limit_exceed",
  //   }, { status: 429 })
  // }
if(req.method !== "GET"){
  const lala = await slidingWindowRateLimit(req, user.user_id);

  if (!lala.allowed) return NextResponse.json({
    success: false,
    errCode: "rate_limit_exceed",
  }, { status: 429 });
}
  return response;
};

export const config = {
  matcher: ["/api/v1/private/:path*"],
};