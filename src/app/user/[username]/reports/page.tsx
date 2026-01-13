import { ReportSection } from "@components";
import { getReportsOnContent } from "@lib/helpers/common";
import { getQueryClient, prefetchQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ParloPageProps } from "@type/other";

const UserReportsPage = async ({ params }: ParloPageProps) => {

    const cnid = (await params).id.split('-')[0];

    const queryClient = getQueryClient();

    await prefetchQuery({
        queryClient,
        queryFn: () => getReportsOnContent(cnid),
        queryKey: getQueryKeys("reports_cnid", { cnid })
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ReportSection content_id={cnid} />
        </HydrationBoundary>
    )
}

export default UserReportsPage;