import { verifyToken } from "@lib/auth/token";
import { getSession, redisClient } from "@lib/auth/session";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  console.log(req.ip);
  const token = cookies().get("token");
  if (!token) console.log("Token unavailable");
  try {
    const payload = token?.value ? verifyToken(token.value) : null;

    console.log(payload);

    if (!redisClient.isOpen) redisClient.connect();

    const session = await getSession("6754b21c18f2ff8952d96ff4");
    console.log("session:");
    console.log(session);
    if (payload)
      return NextResponse.json({ result: token, error: null, status: true });
    return NextResponse.json({ result: token, error: null, status: false });
  } catch (err: any) {
    console.log(err.message);
    console.log(err.message.includes("invalid"));
    // if (err.message.includes("invalid")) console.log("Some other error", err);
    return NextResponse.json({ result: null, success: false });
  }
};
