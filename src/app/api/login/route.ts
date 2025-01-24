import { generateToken } from "@lib/auth/token";
import { storeSession } from "@lib/auth/session";
import { connectPPDB } from "@lib/database";
import { emailSchema } from "@lib/schemas";
import { UserData } from "@model/users";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const email = req.nextUrl.searchParams.get("email");
  const parsed = emailSchema.safeParse(email);

  if (parsed.error)
    return NextResponse.json({
      result: null,
      success: false,
      error: parsed.error.errors,
    });

  try {
    const isDbConnected = await connectPPDB();
    if (!isDbConnected)
      return NextResponse.json({
        result: null,
        success: false,
        error:
          "Unable to connect database, please check your connection and try again",
      });

    const user = await UserData.findOne({ email }, { reports: 0 }).populate(
      "user_id",
      "name dob bio lastUpdateAt profile createdAt"
    );
    if (!user)
      return NextResponse.json(
        {
          result: null,
          success: false,
          error: "No user exist with the given email",
        },
        { status: 404 }
      );

    const {
      user_id,
      celebs,
      watch,
      genres,
      isBanned,
      followers,
      following,
      post_count,
      comments_count,
      collection_count,
      public_collection_count,
      recommendations_count,
      favourites_count,
      recently_joined,
    } = user;
    const { _id, name, username, dob, profile, createdAt, lastUpdatedAt, bio } =
      user_id;
    const id = _id.toString();

    const isSession = await storeSession(id, { isBanned: isBanned });
    if (!isSession)
      return NextResponse.json({
        result: null,
        success: false,
        error:
          "Looks like your internet connection is not stable. Please check your connection and try again.",
      });

    generateToken({ user_id: id, dob });

    return NextResponse.json({
      result: {
        _id,
        name,
        bio,
        username,
        dob,
        profile,
        email,
        lastUpdatedAt,
        createdAt,
        celebs,
        watch,
        genres,
        followers,
        following,
        post_count,
        comments_count,
        collection_count,
        public_collection_count,
        recommendations_count,
        favourites_count,
        recently_joined,
      },
      success: true,
      error: "",
    });
  } catch (err: any) {
    console.log("Error occured while login:", err);
    return NextResponse.json({
      result: null,
      success: false,
      error:
        "Something went wrong on the server. Please try again but if the error persists, please report it.",
    });
  }
};
