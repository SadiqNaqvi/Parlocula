import { getMembers } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import MembersList from "./MembersList";

const Page = async ({ params, searchParams }: { params: { id: string }, searchParams: { p?: string } }) => {

    const page: number = parseInt(searchParams.p || "1") || 1;

    const tid = params.id.split('-')[0];

    const queryClient = getQueryClient();

    await queryClient.prefetchInfiniteQuery({
        queryKey: getQueryKeys("members_tid_page", { id: tid, page }),
        queryFn: () => queryFunction(getMembers, [tid, page], page),
        staleTime: 60 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
        initialPageParam: page,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MembersList tid={tid} page={page} />
        </HydrationBoundary>
    )
}

export default Page;