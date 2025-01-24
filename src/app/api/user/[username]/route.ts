import { connectPPDB } from "@lib/database";
import { UserData } from "@model";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { username: string } }
) => {
  const { username } = params;

  try {
    const isDbConnected = await connectPPDB();
    if (!isDbConnected)
      return NextResponse.json({
        result: null,
        success: false,
        error:
          "Database connection failed. Please try again but if the error persists, please report it.",
      });

    const data = await UserData.findOne(
      { username },
      {
        followers: 1,
        following: 1,
        post_count: 1,
        comments_count: 1,
        public_collection_count: 1,
      }
    ).populate("user_id", "name profile");

    const {
      user_id,
      followers,
      following,
      post_count,
      comments_count,
      public_collection_count,
    } = data;
    const { name, profile } = user_id;

    const user = {
      _id: user_id,
      name,
      username,
      profile,
      followers,
      following,
      post_count,
      comments_count,
      public_collection_count,
    };

    return NextResponse.json({
      result: user,
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
