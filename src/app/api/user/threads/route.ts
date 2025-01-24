import { Member } from "@model";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  const user = getUser();
  if (!user)
    return NextResponse.json(
      { response: null, error: "Unauthorized", success: false },
      { status: 400 }
    );

  const params = req.nextUrl.searchParams;
  const pageParam = params.get("p") || "1";
  const page = parseInt(pageParam) || 1;
  try {
    const total = await Member.countDocuments({ user_id: user });

    const data = await Member.find({ user_id: user._id })
      .limit(20)
      .skip((page - 1) * 20)
      .populate("thread_id", "title description poster nsfw")
      .exec();

    return NextResponse.json(
      { response: { data, total }, error: "", success: true },
      { status: 200 }
    );
  } catch (err) {
    console.log("Failed to fetch threads for user: " + err);
    return NextResponse.json(
      { response: null, error: err, success: false },
      { status: 500 }
    );
  }
};
