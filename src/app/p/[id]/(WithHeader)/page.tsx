import { getCommentsOnPost } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, isValidObjectId, queryFunction, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import CommentSection from "./tabs/CommentSection";
import FilterTiles from "@components/Router/FilterTIles";

type Props = { params: { id: string }, searchParams: { p?: string, f?: string } };

export default async function Page({ params, searchParams }: Props) {

    const queryClient = getQueryClient();

    const { id } = params;

    const pid = id.split('-')[0];
    if (pid && !isValidObjectId(pid)) return null;

    const { filter, page } = refineSearchParams("comments", searchParams.p, searchParams.f);

    await queryClient.prefetchInfiniteQuery({
        queryKey: getQueryKeys('commentsOfPost_pid_filter_page', { pid, page: String(page), filter }),
        queryFn: () => queryFunction(getCommentsOnPost, [{ id: pid, page, filter }], page),
        initialPageParam: page,
        staleTime: 60 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <section className="my-6">
                <FilterTiles type="comments" />
            </section>
            <CommentSection filter={filter} id={pid} page={page} />
        </HydrationBoundary>
    )
}