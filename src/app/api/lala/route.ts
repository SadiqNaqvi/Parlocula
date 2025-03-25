import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const cookieStore = cookies();
  console.log("sid", cookieStore.get("sid")?.value);
  console.log("uid", cookieStore.get("uid")?.value);
  console.log("username", cookieStore.get("username")?.value);

  return NextResponse.json({ success: true });
};

export const POST = async (r: NextRequest) => {
  const data = r.body;
  const formData = await r.formData();

  console.log("data", data);
  console.log("formdata", formData);

  return NextResponse.json({ success: true });
};
