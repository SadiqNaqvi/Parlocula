import { connectPPDB } from "@lib/database";
import { isValidObjectId } from "@lib/utils";
import { Post } from "@model";
import { NextResponse } from "next/server";

export const GET = async (
  r: any,
  { params: { thread_id } }: { params: { thread_id: string } }
) => {
  if (!isValidObjectId(thread_id))
    return NextResponse.json({
      result: null,
      success: false,
      error:
        "Looks like you came across a wrong way! Please go back and try again.",
    });

  try {
    const isDbConnected = await connectPPDB();
    if (!isDbConnected)
      return NextResponse.json({
        result: null,
        success: false,
        error:
          "Database connection failed! Please try again but if the error persists, report it.",
      });

    const total = Post.countDocuments({
      tag: "frames",
      $expr: {
        $gte: [{ $size: "frames" }, 1],
      },
    });

    const data = Post.find(
      {
        tag: "frames",
        $expr: {
          $gte: [{ $size: "frames" }, 1],
        },
      },
      { body: 0, links: 0, tag: 0, edited: 0, updatedAt: 0 }
    )
      .sort({ createdAt: -1 })
      .populate("thread_id", "title")
      .populate("user_id", "profile");

    return NextResponse.json({
      results: { data, total },
      success: true,
      error: null,
    });
  } catch (err) {
    console.error("Error occured while fetching frame-posts:", err);
    return NextResponse.json({
      result: null,
      success: false,
      error:
        "Something went wrong on the server! Please try again but if the error persists, report it.",
    });
  }
};
