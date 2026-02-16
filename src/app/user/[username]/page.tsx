import FilterTiles from "@components/FilterTiles";
import { getUserFromToken } from "@lib/auth/utils";
import { getPostsOfUser, getUserByUsername } from "@lib/helpers/common";
import { fetchQuery, getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ParloPageProps } from "@type/other";
import { cookies } from "next/headers";
import PostSection from "./tabs/PostSection";

const Page = async ({ params, searchParams }: ParloPageProps) => {

    const queryClient = getQueryClient();
    const { username } = await params;
    const { f, p } = await searchParams;
    const { filter, page } = refineSearchParams("userPosts", p, f);

    const currentUser = await getUserFromToken(await cookies());

    const allowNsfw = currentUser ? !currentUser.filterContent : false;

    const user = await fetchQuery({
        queryClient,
        queryFn: () => getUserByUsername(username),
        queryKey: getQueryKeys("user_username", { username }),
    });

    if (!user) return null;

    const uid = user._id;

    await prefetchInfiniteQuery({
        queryKey: getQueryKeys("postsOfUser_uid_filter", { uid, filter }),
        queryFn: () => getPostsOfUser(uid, page, allowNsfw, filter),
        initialPageParam: page,
        queryClient,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="p-2">
                <FilterTiles type="userPosts" />
            </div>
            <PostSection allowNsfw={allowNsfw} uid={uid} username={username} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default Page;