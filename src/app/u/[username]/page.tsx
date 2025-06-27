import { getPostsOfUser } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import PostSection from "./tabs/PostSection";

type Props = { params: { username: string }, searchParams: { p?: string, f?: string } }

const Page = async ({ params: { username }, searchParams: { f, p } }: Props) => {

    const queryClient = getQueryClient();

    const { filter, page } = refineSearchParams("userPosts", p, f);
    await queryClient.prefetchInfiniteQuery({
        queryKey: getQueryKeys("postsOfUser_username_filter_page", { username, filter, page }),
        queryFn: () => queryFunction(getPostsOfUser, [username, page, filter], page),
        initialPageParam: page,
        staleTime: 60 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PostSection username={username} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default Page;