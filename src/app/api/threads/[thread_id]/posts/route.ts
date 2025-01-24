import { connectPPDB } from "@lib/database";
import { getUser, isValidObjectId } from "@lib/utils";
import PostLink from "@model/postLinks_model";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: { slug: string } }
) => {
  const thread_id = params.slug;

  if (!isValidObjectId(thread_id))
    return NextResponse.json(
      {
        error: "Oops! Looks like you came across the wrong way.",
        result: null,
        success: false,
      },
      { status: 402 }
    );

  const sParams = req.nextUrl.searchParams;
  const pageParam = sParams.get("p") || "1";
  const page = parseInt(pageParam) || 1;

  const user = getUser();
  const filter = user && user.age >= 18 ? {} : { nsfw: false };
  try {
    await connectPPDB();

    const total_results = await PostLink.countDocuments({
      thread_id,
      ...filter,
    });

    const total_pages = Math.ceil(total_results / 20);
    const data = await PostLink.find({ thread_id, ...filter }, {})
      .limit(20)
      .skip((page - 1) * 20)
      .populate("post_id", "title body media media_type createdAt updatedAt")
      .exec();

    return NextResponse.json(
      {
        error: "",
        result: { data, total_results, total_pages, page },
        success: true,
      },
      { status: 200 }
    );
    
  } catch (err: any) {
    console.log("Failed to fetch posts by thread id: " + err.message);
    return NextResponse.json(
      {
        error:
          "Something unexpected happened on the server. Please try again. If the error persists, make sure to report it.",
        result: null,
        success: false,
      },
      { status: 500 }
    );
  }
};
/*
THREAD
1. Hot - Descending date and user count
2. Popular - Descending user count and post count
3. Trending - Created within a week and descending post count
4. Newest 

POST
1. Hot - Descending date and views
2. Popular - Descending views, date and upvotes 
3. Controversial - Descending date and comments
4. Newest
*/
