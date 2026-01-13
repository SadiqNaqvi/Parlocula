import { getCommentsOfUser, getUserByUsername } from "@lib/helpers/common";
import { fetchQuery, getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Comments from "../tabs/CommentSection";
import FilterTiles from "@components/Router/FilterTIles";
import { cookies } from "next/headers";
import { getUserFromToken } from "@lib/auth/utils";
import { ParloPageProps } from "@type/other";

const Page = async ({ params, searchParams }: ParloPageProps) => {

    const queryClient = getQueryClient();
    const { username } = await params;
    const { f, p } = await searchParams;

    const currentUser = await getUserFromToken(await cookies());

    const allowNsfw = currentUser ? !currentUser.filterContent : false;

    const user = await fetchQuery({
        queryClient,
        queryFn: () => getUserByUsername(username),
        queryKey: getQueryKeys("user_username", { username }),
    });

    if (!user) return null;

    const uid = user._id;

    const { filter, page } = refineSearchParams("comments", p, f);

    await prefetchInfiniteQuery({
        queryKey: getQueryKeys("commentsOfUser_uid_filter", { uid, filter }),
        queryFn: () => getCommentsOfUser(uid, page, allowNsfw, filter),
        initialPageParam: page,
        queryClient,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="my-2">
                <FilterTiles type="comments" />
            </div>
            <Comments allowNsfw={allowNsfw} uid={uid} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default Page;