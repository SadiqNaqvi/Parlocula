import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const GET = (
  req: NextRequest,
  { params }: { params: { slug: string } }
) => {
  console.log("token", cookies().get("token")?.value);

  const response = NextResponse.json({ result: null });
  cookies().set("token", "redpool08", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
  return response;
};
