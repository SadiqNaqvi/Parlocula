// Revalidate Tags - hot-threads

import { connectPPDB } from "@lib/database";
import { Thread } from "@model";
import { NextRequest, NextResponse } from "next/server";

// Route handler for Hot threads

export const GET = async (request: NextRequest) => {
  const params = request.nextUrl.searchParams;
  const page = params.get("p") || "1";
  const skip = (parseInt(page) - 1) * 20;

  try {
    await connectPPDB();
    const total_results = await Thread.countDocuments();
    const total_pages = Math.ceil(total_results / 20);
    const data = await Thread.find(
      {},
      {
        title: 1,
        description: 1,
        poster: 1,
      }
    )
      .sort({ user_count: -1, createdAt: -1 })
      .limit(20)
      .skip(skip)
      .exec();
    return NextResponse.json(
      {
        response: { data, total_results, page, total_pages },
        error: "",
        success: true,
      },
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
