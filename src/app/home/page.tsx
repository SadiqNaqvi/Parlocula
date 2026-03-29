import { getUserFromToken } from "@lib/auth/utils";
import { getTrendingPosts, getUserFeed } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { createArray, getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import FeedPage from "./FeedPage";
import { PropsWithChildren } from "react";
import { ParloPageProps } from "@type/other";

const HomeFeedPage = async ({ searchParams, children }: PropsWithChildren<ParloPageProps>) => {

    const jar = await cookies();
    const user = await getUserFromToken(jar);
    const queryClient = getQueryClient();
    const sp = await searchParams
    const page: number = parseInt(sp.p || "1") || 1;

    await Promise.all(
        createArray<any>(
            prefetchInfiniteQuery({
                queryClient,
                queryFn: () => getTrendingPosts(page),
                queryKey: getQueryKeys("trendingPosts", {}),
                initialPageParam: page,
            })
        ).concatConditionally(user, (u) =>
            prefetchInfiniteQuery({
                queryClient,
                queryFn: () => getUserFeed(u.user_id, page),
                queryKey: getQueryKeys("curatedPost_uid", { uid: u.user_id }),
                initialPageParam: page
            })
        )
    )

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <FeedPage />
        </HydrationBoundary>
    )
}

export default HomeFeedPage;