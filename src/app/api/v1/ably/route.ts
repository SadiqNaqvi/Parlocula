import Ably from "ably";
import { NextRequest, NextResponse } from "next/server";

export const revalidate = 0;

export const GET = async (r: NextRequest) => {
  try {
    const clientId = r.nextUrl.searchParams.get("clientId");
    if (!clientId) return Response.json("Unauthorized", { status: 401 });
    const client = new Ably.Rest(process.env.ABLY_API_KEY!);
    const tokenRequestData = await client.auth.createTokenRequest({
      clientId,
      ttl: 1000 * 3600,
    });
    return NextResponse.json(tokenRequestData, { status: 200 });
  } catch (e: any) {
    return NextResponse.json("Something went wrong", { status: 500 });
  }
};
