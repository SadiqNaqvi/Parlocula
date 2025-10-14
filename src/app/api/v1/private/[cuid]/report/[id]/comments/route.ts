// Reported Comments in a thread. Should only be seen by managers.
// Here id is thread_id.

import { getRequest } from "@lib/helpers/common";
import { reportedContentAggregation } from "@lib/pipelines";
import { getPageParams, ObjectId } from "@lib/utils";
import { Member } from "@model";
import Report from "@model/reports";

export const GET = getRequest(async (r, params) => {
    const { cuid, id } = params;
    const page = getPageParams(r);

    const isManager = await Member.exists({
        user_id: ObjectId(cuid),
        thread_id: ObjectId(id),
        role: { $or: ["moderator", "creator"] }
    });

    if (!isManager) return { success: false, errCode: "unauthorized_access" }


    const response = await Report.aggregate(
        reportedContentAggregation({
            content_type: "Comment",
            thread_id: id,
            page,
        })
    );

    return { success: true, result: response[0] ?? { data: [], total: 0 } }
})