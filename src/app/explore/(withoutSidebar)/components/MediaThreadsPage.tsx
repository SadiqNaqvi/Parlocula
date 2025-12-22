import ThreadList from "@app/explore/(withoutSidebar)/components/ThreadList";
import { getUserFromToken } from "@lib/auth/utils";
import { getThreadsForMedia } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";

type Props = {
    params: { id: string },
    searchParams?: { p?: string, f?: string },
}

const MediaThreadsPage = async ({ params, searchParams }: Props) => {

    const queryClient = getQueryClient();

    const { filter, page } = refineSearchParams("threads", searchParams?.p, searchParams?.f)

    const id = params.id.split('-')[0];

    const user = await getUserFromToken(cookies());

    const allowNsfw = user ? !user.filterContent : false;

    await prefetchInfiniteQuery({
        queryKey: ["threads-for-media", id, filter],
        queryFn: () => getThreadsForMedia(id, page, allowNsfw),
        initialPageParam: page,
        queryClient,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ThreadList id={id} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default MediaThreadsPage;