import { connectPPDB } from "@lib/database";
import { isValidObjectId } from "@lib/utils";
import { Thread } from "@model";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  r: NextRequest,
  { params }: { params: { thread_id: string } }
) => {
  const {thread_id} = params;
  if (!isValidObjectId(thread_id))
    return NextResponse.json(
      {
        result: null,
        error: "Invalid Thread id. Please go back and try again",
        success: false,
      },
      { status: 400 }
    );

  try {
    const isDbConnected = await connectPPDB();
    if (!isDbConnected)
      return NextResponse.json({
        result: null,
        error:
          "Database connection failed. Please try again but if the error persists, please report.",
        success: false,
      });

    const data = await Thread.findById(thread_id);

    return NextResponse.json(
      {
        result: data,
        error: null,
        success: true,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.log("Failed to fetch thread by id:", err);
    return NextResponse.json(
      {
        result: null,
        error:
          "Something went wrong on the server. Please try again but if the error persists, please report.",
        success: false,
      },
      { status: 500 }
    );
  }
};
