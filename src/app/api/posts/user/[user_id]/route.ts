// revalidate-tags: posts-of-user:${user_id}

import { paginatedQueryLimit } from "@lib/constants";
import { connectPPDB } from "@lib/database";
import { Post } from "@model";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { user_id: string } }
) => {
  const { user_id } = params;
  const search = req.nextUrl.searchParams;
  const pageParam = parseInt(search.get("page") || "1");
  const page = isNaN(pageParam) ? 1 : pageParam < 1 ? 1 : pageParam;

  if (!isValidObjectId(user_id))
    return NextResponse.json({
      result: null,
      success: false,
      error: "Invalid user id",
    });

  try {
    const isDbConnected = await connectPPDB();
    if (!isDbConnected)
      return NextResponse.json({
        result: null,
        success: false,
        error: "Database connection failed. Please try again in a while.",
      });

    const posts = await Post.find({ user_id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * paginatedQueryLimit)
      .limit(paginatedQueryLimit);

    return NextResponse.json({
      result: posts,
      error: null,
      success: true,
    });
  } catch (err) {
    console.log("Error occured while fetching posts of user:", err);
    return NextResponse.json({
      result: null,
      success: false,
      error:
        "Something went wrong on the server. Please try again but if the error persists, report it.",
    });
  }
};
