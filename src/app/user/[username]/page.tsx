import { getPostsOfUser, getUserByUsername } from "@lib/helpers/common";
import { fetchQuery, getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import PostSection from "./tabs/PostSection";
import FilterTiles from "@components/Router/FilterTIles";
import { cookies } from "next/headers";
import { getUserFromToken } from "@lib/auth/utils";

type Props = { params: { username: string }, searchParams: { p?: string, f?: string } }

const Page = async ({ params: { username }, searchParams: { f, p } }: Props) => {

    const queryClient = getQueryClient();

    const { filter, page } = refineSearchParams("userPosts", p, f);


    const currentUser = await getUserFromToken(cookies());

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
            <div className="my-2">
                <FilterTiles type="userPosts" />
            </div>
            <PostSection allowNsfw={allowNsfw} uid={uid} username={username} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default Page;