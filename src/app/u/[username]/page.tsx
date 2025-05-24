import { NotFound } from "@components/ui";
import { getUserFromToken } from "@lib/auth/utils";
import { checkUserConnection, fetchCurrentUser, getPostsOfUser, getUserByUsername } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { RequestedUser } from "@type/internal";
import { cookies } from "next/headers";
import PostSection from "./tabs/PostSection";

type Props = { params: { username: string }, searchParams: { p?: string, f?: string } }

const Page = async ({ params: { username }, searchParams: { f, p } }: Props) => {

    const queryClient = getQueryClient();

    const { filter, page } = refineSearchParams("userPosts", p, f);

    const user = await getUserFromToken(cookies());
    const current = user?.username === username;

    const queryFn = current ? fetchCurrentUser : getUserByUsername;
    const props = current ? user.user_id : username;

    const userKeys = getQueryKeys("user_username", { username });

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: userKeys,
            queryFn: () => queryFunction(queryFn, [props]),
            staleTime: 60 * 60 * 1000,
            gcTime: 60 * 60 * 1000,
        }),

        queryClient.prefetchInfiniteQuery({
            queryKey: getQueryKeys("postsOfUser_username_filter_page", { username, filter, page }),
            queryFn: () => queryFunction(getPostsOfUser, [username, page, filter], page),
            initialPageParam: page,
            staleTime: 60 * 60 * 1000,
            gcTime: 60 * 60 * 1000,
        }),
    ]);

    const requestedUser = queryClient.getQueryData<RequestedUser>(userKeys);

    if (!requestedUser) return (
        <section className="size-screen">
            <NotFound
                title="Nothing is found"
                paras={[
                    "The user might have changed their username, deactivated their account or not exist at all.",
                    "Please search the user by their username in the explore page."
                ]}
            />
        </section>
    )

    if (user && !current && requestedUser)
        queryClient.prefetchQuery({
            queryKey: getQueryKeys("connection_ruid", { ruid: requestedUser._id }),
            queryFn: () => queryFunction(checkUserConnection, [user.user_id, requestedUser._id]),
            staleTime: 60 * 60 * 1000
        });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PostSection username={username} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default Page;