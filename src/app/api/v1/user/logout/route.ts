import { deleteSession } from "@lib/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const DELETE = () => {
  const cookieStore = cookies();
  const session_id = cookieStore.get("sid")?.value;

  if (session_id && !deleteSession(session_id))
    return NextResponse.json({
      result: null,
      success: false,
      error:
        "Failed to perform logout! Please try again but if the error persists, report it.",
    });

  cookieStore.delete("sid");
  cookieStore.delete("uid");
  cookieStore.delete("username");

  return NextResponse.json({
    result: null,
    success: true,
    errCode: null,
  });
};
