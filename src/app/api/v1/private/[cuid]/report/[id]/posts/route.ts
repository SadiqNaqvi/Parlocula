// Reported Posts in a thread. Should only be seen by managers.
// Here id is thread_id.

import { getHandler } from "@lib/helpers/handlers";
import { reportedContentAggregation } from "@lib/pipelines";
import { getPageParams } from "@lib/utils";
import { Member } from "@model";
import Report from "@model/reports";

export const GET = getHandler(async (r, params) => {
    const { cuid, id } = params;
    const page = getPageParams(r) - 1;

    const isManager = await Member.exists({
        thread_id: id,
        user_id: cuid,
        role: { $in: ["moderator", "creator"] }
    });

    if (!isManager) return { success: false, errCode: "unauthorized_access" }


    const response = await Report.aggregate(
        reportedContentAggregation({
            content_type: "Post",
            thread_id: id,
            page,
        })
    );

    return { success: true, result: response[0] ?? { data: [], total: 0 } }
});