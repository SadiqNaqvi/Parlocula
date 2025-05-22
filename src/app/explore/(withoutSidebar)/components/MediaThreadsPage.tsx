import ThreadList from "@app/explore/(withoutSidebar)/components/ThreadList";
import { getThreadsForMedia } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { queryFunction, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

type Props = {
    params: { id: string },
    searchParams: { p?: string, f?: string },
}

const MediaThreadsPage = async ({ params, searchParams }: Props) => {

    const queryClient = getQueryClient();

    const { filter, page } = refineSearchParams("threads", searchParams.p, searchParams.f)

    const id = params.id.split('-')[0];

    await queryClient.prefetchInfiniteQuery({
        queryKey: ["threads-for-media", id, filter],
        queryFn: () => queryFunction(getThreadsForMedia, [id, page]),
        initialPageParam: page,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ThreadList id={id} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default MediaThreadsPage;