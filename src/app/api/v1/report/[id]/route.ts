import { getHandler } from "@lib/helpers/handlers";
import { reportAggregationPipeline } from "@lib/pipelines";
import Report from "@model/reports";

// Route Handler to get all the reports on a content, could be post/comment/user
// Thread Reports should only be seen by managers, it can be fetched from /private/:cuid/report/:id

export const GET = getHandler(async (r, props) => {
    const { id } = props;

    const response = await Report.aggregate(
        reportAggregationPipeline({
            page: 1,
            content_id: id,
            isThread: false,
        })
    );

    return { success: true, result: { reports: response ?? [] } }
})