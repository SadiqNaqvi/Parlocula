import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = (
  req: NextRequest,
  { params }: { params: { lala: string } }
) => {
  console.log("token", cookies().get("token")?.value);

  const response = NextResponse.json({ result: null });
  response.cookies.delete("token");
  return response;
};
