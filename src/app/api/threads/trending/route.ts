import { connectPPDB } from "@lib/database";
import { getUser } from "@lib/utils";
import { Threads } from "@model/threads_model";
import { NextRequest, NextResponse } from "next/server";

// Route handler for trending threads

export const GET = async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;
  const page = params.get("p") || "1";
  const skip = (parseInt(page) - 1) * 20;

  const user = getUser();
  const filter = user && user.age >= 18 ? {} : { nsfw: false };

  try {
    await connectPPDB();
    const total = await Threads.countDocuments(filter);
    const data = await Threads.find(filter, {
      title: 1,
      description: 1,
      poster: 1,
    })
      .sort({ user_count: -1, post_count: -1 })
      .limit(20)
      .skip(skip)
      .exec();
    return NextResponse.json(
      { response: { data, total }, error: "", success: true },
      { status: 200 }
    );
  } catch (err) {
    console.error("Failed to fetch threads: " + err);
    return NextResponse.json(
      { response: null, error: err, success: false },
      { status: 500 }
    );
  }
};
