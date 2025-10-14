import { getInvitationListFromCache, getRoomListFromCache } from "@lib/helpers/redis";
import { getRedis } from "@lib/providers/redis";
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

export const POST = async () => {

  const uid1 = "67f6da546669e8c6f4b7315d";
  const uid2 = "6830c28189c5e9c2826732de";
  const rmid = "68c1ae0ce956f0d73cf3f6ea"

  // const room = await (await getRedis()).zrevrange(`user:${uid2}:invitations`, 0, 10);
  const room = await getRoomListFromCache(uid2, 1);
  // const room = await getInvitationListFromCache(uid2);

  console.log("aggregation result", room);

  return Response.json("Successfull", { status: 200 });
};
