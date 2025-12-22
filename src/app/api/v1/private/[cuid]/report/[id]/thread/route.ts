import { getHandler } from "@lib/helpers/handlers";
import { reportAggregationPipeline } from "@lib/pipelines";
import { getPageParams } from "@lib/utils";
import { Member } from "@model";
import Report from "@model/reports";

// Reports on the Thread. Should only be see my the managers (creator and moderators)
// Here id is thread id.
export const GET = getHandler(async (r, params) => {
    const { id, cuid } = params;
    const page = getPageParams(r);

    const isManager = await Member.exists({
        thread_id: id,
        user_id: cuid,
        role: { $or: ["moderator", "creator"] }
    });

    if (!isManager)
        return { success: false, errCode: "unauthorized_access" }

    const response = await Report.aggregate(
        reportAggregationPipeline({
            content_id: id,
            page,
            isThread: true,
        })
    );

    return {
        success: true,
        result: response[0] ?? { data: [], total: 0 }
    };
});