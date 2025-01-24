// revalidate tag: isJoined-thread:${thread_id}-user:${user_id}

import { connectPPDB } from "@lib/database";
import { isValidObjectId } from "@lib/utils";
import { Member } from "@model";
import { NextResponse } from "next/server";

export const GET = async (
  r: any,
  { params }: { params: { thread_id: string; user_id: string } }
) => {
  const { thread_id, user_id } = params;

  if (!isValidObjectId(thread_id) || !isValidObjectId(user_id))
    return NextResponse.json({
      result: null,
      success: false,
      error: "Invalid Id! Please go back and try again.",
    });

  try {
    const isDbConnected = await connectPPDB();
    if (!isDbConnected)
      return NextResponse.json({
        result: null,
        success: false,
        error:
          "Database connection failed! Please check your connection and try again.",
      });

    const isJoined = Member.exists({ user_id, thread_id });

    return NextResponse.json({
      result: !!isJoined,
      success: true,
      error: null,
    });
  } catch (err) {
    console.log(
      "Error occured while checking if user is joined in thread:",
      err
    );
    return NextResponse.json({
      result: null,
      success: false,
      error: "Something went wrong on the server! Please go back and try again",
    });
  }
};
