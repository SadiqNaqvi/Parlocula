import { ThreadUserLink } from "@model/members";
import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@lib/utils";
import { connectPPDB } from "@lib/database";

export const GET = async (req: NextRequest) => {
  const user = getUser();
  if (!user)
    return NextResponse.json(
      {
        response: null,
        error: "Unauthorized! You need to log-in to access this.",
        success: false,
      },
      { status: 400 }
    );

  const params = req.nextUrl.searchParams;
  const pageParam = params.get("p") || "1";
  const page = parseInt(pageParam) || 1;
  const filter = user && user.age >= 18 ? {} : { nsfw: false };

  try {
    await connectPPDB();
    const total = await ThreadUserLink.countDocuments({
      user_id: user._id,
      ...filter,
    });
    const data = await ThreadUserLink.find({ user_id: user._id, ...filter })
      .limit(20)
      .skip((page - 1) * 20)
      .populate("thread_id", "title description poster")
      .exec();

    return NextResponse.json(
      { response: { data, total }, error: "", success: true },
      { status: 200 }
    );
  } catch (err) {
    console.log("Failed to fetch threads for user: " + err);
    return NextResponse.json(
      {
        response: null,
        error: `Something went wrong on the server side: ${err}`,
        success: false,
      },
      { status: 500 }
    );
  }
};
