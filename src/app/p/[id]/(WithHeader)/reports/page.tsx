import ReportSection from "@components/ReportSection";
import { getReportsOnContent } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

const PostReportsPage = async ({ params }: { params: { id: string } }) => {

    const cnid = params.id.split('-')[0];

    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryFn: () => queryFunction(getReportsOnContent, [cnid]),
        queryKey: getQueryKeys("reports_cnid", { cnid })
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ReportSection content_id={cnid} />
        </HydrationBoundary>
    )
}

export default PostReportsPage;