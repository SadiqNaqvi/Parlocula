import { getUserFromToken } from "@lib/auth";
import { checkIfItemSaved, getCommentsOnPost, getPostById, getReactionOnPost, getReposts } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import CommentSection from "./tabs/CommentSection";

type Props = { params: { id: string }, searchParams: { p?: string, f?: string } };

export const generateStaticParams = async () => {
    return []
}

export default async function Page({ params, searchParams }: Props) {

    const queryClient = getQueryClient();

    const { filter, page } = refineSearchParams("comments", searchParams.p, searchParams.f);
    const { id } = params;

    const pid = id.split('-')[0];
    const user = await getUserFromToken(cookies());

    // Prefetching the data of the next tab for faster access.
    queryClient.prefetchInfiniteQuery({
        queryKey: getQueryKeys("reposts_pid_page", { pid, page }),
        queryFn: () => queryFunction(getReposts, [pid, page], page),
        initialPageParam: 1,
        staleTime: 60 * 60 * 1000,
        gcTime: 60 * 60 * 1000
    });

    // Prefetching all the data that the current page need.
    await Promise.all([
        queryClient.prefetchInfiniteQuery({
            queryKey: getQueryKeys('commentsOfPost_pid_filter_page', { pid, page, filter }),
            queryFn: () => queryFunction(getCommentsOnPost, [{ id: pid, page, filter }], page),
            initialPageParam: page,
            staleTime: 60 * 60 * 1000,
            gcTime: 60 * 60 * 1000
        }),

        queryClient.prefetchQuery({
            queryKey: getQueryKeys("post_id", { pid }),
            queryFn: () => queryFunction(getPostById, [pid]),
            staleTime: 60 * 60 * 1000,
            gcTime: 60 * 60 * 1000
        }),
        ...(user ? [
            queryClient.prefetchQuery({
                queryKey: getQueryKeys("reaction_pid", { pid }),
                queryFn: () => queryFunction(getReactionOnPost, [pid, user.user_id]),
                staleTime: 60 * 60 * 1000,
                gcTime: 60 * 60 * 1000
            }),
            queryClient.prefetchQuery({
                queryKey: getQueryKeys("isContentSaved_type_id", { type: "post", id: pid }),
                queryFn: () => queryFunction(checkIfItemSaved, [pid, user.user_id]),
                staleTime: 60 * 60 * 1000,
                gcTime: 60 * 60 * 1000
            }),
        ] : [])
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <CommentSection filter={filter} id={pid} page={page} />
        </HydrationBoundary>
    )
}