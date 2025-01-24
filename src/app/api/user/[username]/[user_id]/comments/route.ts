import { paginatedQueryLimit } from "@lib/constants";
import { connectPPDB } from "@lib/database";
import { Comment } from "@model";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { user_id: string } }
) => {
  const { user_id } = params;
  if (!isValidObjectId(user_id))
    return NextResponse.json({
      result: null,
      success: false,
      error: "Invalid user id",
    });

  const search = req.nextUrl.searchParams;
  const pageParam = parseInt(search.get("page") || "1");
  const page = isNaN(pageParam) ? 1 : pageParam < 1 ? 1 : pageParam;

  try {
    const isDbConnected = await connectPPDB();
    if (!isDbConnected)
      return NextResponse.json({
        result: null,
        success: false,
        error:
          "Database connection failed. Please try again but if the error persists, please report it.",
      });

    const comments = await Comment.find({ user_id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * paginatedQueryLimit)
      .limit(paginatedQueryLimit);

    return NextResponse.json({
      result: comments,
      error: null,
      success: true,
    });
  } catch (err) {
    console.log("Error occured while fetching comments of user:", err);
    return NextResponse.json({
      result: null,
      success: false,
      error:
        "Something went wrong on the server. Please try again but if the error persists, report it.",
    });
  }
};
