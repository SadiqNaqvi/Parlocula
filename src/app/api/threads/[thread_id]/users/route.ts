import { connectPPDB } from "@lib/database";
import { getUser } from "@lib/utils";
import { ThreadUserLink } from "@model/members";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { slug: string } }
) => {
  const user = getUser();
  if (!user)
    return NextResponse.json(
      {
        response: null,
        error: "Anauthorized access. You need to log-in to see this.",
        success: false,
      },
      { status: 400 }
    );

  const sParams = req.nextUrl.searchParams;
  const pageParam = sParams.get("p") || "1";
  const page = parseInt(pageParam) || 1;
  const thread_id = params.slug;

  try {
    await connectPPDB();
    if (!(await ThreadUserLink.find({ thread_id, user_id: user._id })))
      return NextResponse.json({
        response: null,
        error:
          "Anauthorized access. You need to join this thread to access the member list.",
        success: false,
      });

    const total = await ThreadUserLink.countDocuments({ thread_id });

    const data = await ThreadUserLink.find({ thread_id }, { user_role: 1 })
      .limit(20)
      .skip((page - 1) * 20)
      .populate("user_id", "username profile")
      .exec();

    return NextResponse.json(
      {
        response: { data, total },
        error: "",
        success: true,
      },
      { status: 202 }
    );
  } catch (err) {
    console.error("Failed to fetch users from thread: " + err);
    return NextResponse.json(
      {
        response: null,
        error:
          "Something went wrong on the server side. Please try again but if the error persists, please report it.",
        success: false,
      },
      { status: 500 }
    );
  }
};
