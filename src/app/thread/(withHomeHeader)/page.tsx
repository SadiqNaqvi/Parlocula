import FilterTiles from "@components/Router/FilterTIles";
import { getThreads } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import ThreadList from "./ThreadList";
import { getUserFromToken } from "@lib/auth/utils";
import { cookies } from "next/headers";

const PopularThreadsPage = async ({ searchParams }: { searchParams: { p?: string, f?: string } }) => {

    const { filter, page } = refineSearchParams("threads", searchParams.p, searchParams.f)

    const queryClient = getQueryClient();

    const user = await getUserFromToken(cookies());

    const allowNsfw = user ? !user.filterContent : false;

    await prefetchInfiniteQuery({
        queryClient,
        queryKey: getQueryKeys("threads_filter", { filter }),
        queryFn: () => getThreads(page, allowNsfw, filter),
        initialPageParam: page,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <section className="my-4">
                <FilterTiles type="threads" />
            </section>
            <ThreadList allowNsfw={allowNsfw} section="popular" filter={filter} page={page} />
        </HydrationBoundary>
    )

}

export default PopularThreadsPage;