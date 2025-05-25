import { NotFound } from "@components/ui";
import { getUserFromToken } from "@lib/auth/utils";
import { checkUserConnection, fetchCurrentUser, getCommentsOfUser, getUserByUsername } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { GeneralGetReturn, RequestedUser } from "@type/internal";
import { cookies } from "next/headers";
import Comments from "../tabs/CommentSection";

type Props = { params: { username: string }, searchParams: { p?: string, f?: string, t?: string } }

const Page = async ({ params: { username }, searchParams: { f, p } }: Props) => {

    const queryClient = getQueryClient();

    const { filter, page } = refineSearchParams("comments", p, f);

    const user = await getUserFromToken(cookies());
    const current = user?.username === username;

    const queryFn = current ? fetchCurrentUser : getUserByUsername;
    const props = current ? user.user_id : username;

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: getQueryKeys("user_username", { username }),
            queryFn: () => queryFunction(queryFn, [props]),
            staleTime: 60 * 60 * 1000,
        }),

        queryClient.prefetchInfiniteQuery({
            queryKey: getQueryKeys("commentsOfUser_username_filter_page", { username, filter, page }),
            queryFn: () => queryFunction(getCommentsOfUser, [username, page, filter], page),
            initialPageParam: page,
            staleTime: 60 * 60 * 1000,
            gcTime: 60 * 60 * 1000
        }),
    ]);

    const requestedUser = queryClient.getQueryData<RequestedUser>(getQueryKeys("user_username", { username }));

    if (user && !current && requestedUser)
        queryClient.prefetchQuery({
            queryKey: getQueryKeys("connection_ruid", { ruid: requestedUser._id }),
            queryFn: () => queryFunction(checkUserConnection, [user.user_id, requestedUser._id]),
            staleTime: 60 * 60 * 1000
        });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Comments isCurrentUser username={username} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default Page;