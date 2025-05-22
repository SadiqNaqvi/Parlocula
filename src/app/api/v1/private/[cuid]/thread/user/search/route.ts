import { getRequest } from "@lib/helpers/common";
import { threadsAggregationPipeline } from "@lib/pipelines";
import { getPageParams, ObjectId } from "@lib/utils";
import { Member } from "@model";
import { NextRequest } from "next/server";

// Search the joined threads of the current user.
export const GET = getRequest(
  async (r: NextRequest, params: { cuid: string }) => {
    const page = getPageParams(r) - 1;
    const { cuid } = params;

    const query = r.nextUrl.searchParams.get("q");
    if (!query) return { success: false, errCode: "pp500" };

    const result = await Member.aggregate(
      threadsAggregationPipeline({
        filters: [
          { $match: { userId: ObjectId(cuid) } },
          {
            $lookup: {
              from: "Thread",
              localField: "thread_id",
              foreignField: "_id",
              as: "thread",
            },
          },
          { $unwind: "$thread" },
          {
            $match: { "thread.name": { $regex: query, $options: "i" } },
          },
          { $replaceRoot: { newRoot: "$thread" } },
        ],
        page,
      })
    );

    return { result, success: true };
  }
);
