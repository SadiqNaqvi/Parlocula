import { NotFound } from "@components/ui";
import { getUserFromToken } from "@lib/auth";
import { checkUserConnection, fetchCurrentUser, getListsOfUser, getUserByUsername } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { GeneralGetReturn, RequestedUser } from "@type/internal";
import { cookies } from "next/headers";
import Lists from "../tabs/ListSection";

type Props = { params: { username: string }, searchParams: { p?: string, f?: string, t?: string } }

export const generateStaticParams = async () => {
    return []
}

const Page = async ({ params: { username }, searchParams: { f, p } }: { params: { username: string }, searchParams: { p?: string, f?: string } }) => {

    const queryClient = getQueryClient();

    const { filter, page } = refineSearchParams("lists", p, f);

    const user = await getUserFromToken(cookies());
    const current = user?.username === username;

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: getQueryKeys("user_username", { username }),
            queryFn: () => queryFunction(current ? fetchCurrentUser : getUserByUsername, [current ? user.user_id : username]),
            staleTime: 60 * 60 * 1000,
        }),

        queryClient.prefetchInfiniteQuery({
            queryKey: getQueryKeys("listsOfUser_username_filter", { username, filter }),
            queryFn: () => queryFunction(getListsOfUser, [username, page, filter], page),
            initialPageParam: page,
            staleTime: 60 * 60 * 1000,
            gcTime: 60 * 60 * 1000
        }),
    ]);

    const response = queryClient.getQueryData<GeneralGetReturn<RequestedUser>>(getQueryKeys("user_username", { username }));

    if (!response || !response.success) return (
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

    const requestedUser = response.result;

    if (user && !current)
        queryClient.prefetchQuery({
            queryKey: getQueryKeys("connection_ruid", { ruid: requestedUser._id }),
            queryFn: () => queryFunction(checkUserConnection, [user.user_id, requestedUser._id]),
            staleTime: 60 * 60 * 1000
        });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Lists username={username} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default Page;