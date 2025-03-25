import { NextResponse } from "next/server";

export const GET = (req: any, { params }: { params: { slug: string } }) => {
  console.log(params.slug);
  return NextResponse.json({ success: true });
};
