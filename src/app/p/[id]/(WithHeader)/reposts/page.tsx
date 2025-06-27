import { getReposts } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, isValidObjectId, queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import RepostSection from "../tabs/RepostSection";

export default async function Page({ params, searchParams }: { params: { id: string }, searchParams: { p?: string, f?: string } }) {

    const queryClient = getQueryClient();

    const { id } = params;

    const pid = id.split('-')[0];
    if (pid && !isValidObjectId(pid)) return null;

    const pageParam = searchParams.p ? parseInt(searchParams.p) : 1;
    const page = isNaN(pageParam) ? 1 : pageParam;

    await queryClient.prefetchInfiniteQuery({
        queryKey: getQueryKeys('reposts_pid_page', { pid, page }),
        queryFn: () => queryFunction(getReposts, [pid, page], page),
        initialPageParam: page,
        staleTime: 60 * 60 * 1000,
        gcTime: 60 * 60 * 1000
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <RepostSection id={pid} page={page} />
        </HydrationBoundary>
    )
}