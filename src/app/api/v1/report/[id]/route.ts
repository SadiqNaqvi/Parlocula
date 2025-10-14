import { getRequest } from "@lib/helpers/common";
import { reportAggregationPipeline } from "@lib/pipelines";
import Report from "@model/reports";

// Route Handler to get all the reports on a content, could be post/comment/user
// Thread Reports should only be seen by managers, it can be fetched from /private/:cuid/report/:id

export const GET = getRequest(async (r, props) => {
    const { id } = props;

    const response = await Report.aggregate(
        reportAggregationPipeline({
            page: 1,
            content_id: id,
            isThread: false,
        })
    );

    return { success: true, result: response ?? [] }
})