import { getThreads } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import ThreadList from "./ThreadList";
import FilterTiles from "@components/Router/FilterTIles";

export default async function Page({ searchParams }: { searchParams: { p?: string, f?: string } }) {

    const { filter, page } = refineSearchParams("threads", searchParams.p, searchParams.f)

    const queryClient = getQueryClient();

    await queryClient.prefetchInfiniteQuery({
        queryKey: getQueryKeys("threads_filter", { filter }),
        queryFn: () => queryFunction(getThreads, [page, filter], page),
        initialPageParam: page,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <section className="my-4">
                <FilterTiles type="threads" />
            </section>
            <ThreadList filter={filter} page={page} />
        </HydrationBoundary>
    )

}