import { FullPageLoadingSpinner } from "@components/ui/LoadingSpinner";
import { getUserFromToken } from "@lib/auth/utils";
import { checkUserConnection, fetchCurrentUser, getUserByUsername } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { PropsWithChildren, Suspense } from "react";
import Header from "./Header";

export const generateMetadata = async ({ params: { username } }: { params: { username: string } }) => {
    const { result, success } = await getUserByUsername(username);
    if (!success || !result) return { title: "Popcorn Paragon" }
    return { title: `${username} - Popcorn Paragon`, description: result.bio }
}

const Fetcher = async ({ username, children }: PropsWithChildren<{ username: string }>) => {
    const queryClient = getQueryClient();

    const jar = cookies();
    const user = await getUserFromToken(jar);

    const current = user?.username === username;

    const queryFn = current ? fetchCurrentUser : getUserByUsername;
    const props = current ? user.user_id : username;

    const userKeys = getQueryKeys("user_username", { username });

    const rUser = await queryClient.fetchQuery({
        queryKey: userKeys,
        queryFn: () => queryFunction(queryFn, [props]),
        staleTime: 60 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
    });

    if (user && rUser && !current)
        await queryClient.prefetchQuery({
            queryKey: getQueryKeys("connection_ruid", { ruid: rUser._id }),
            queryFn: () => queryFunction(checkUserConnection, [user.user_id, rUser._id, jar]),
            staleTime: 60 * 60 * 1000,
            gcTime: 60 * 60 * 1000,
        });


    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Header user={Boolean(user)} isCurrent={current} username={username} />
            {children}
        </HydrationBoundary>
    )
}

const Layout = ({ children, params }: PropsWithChildren<{ params: { username: string } }>) => {
    return (
        <main>
            <Suspense fallback={<FullPageLoadingSpinner path={[params.username]} />}>
                <Fetcher username={params.username}>{children}</Fetcher>
            </Suspense>
        </main>
    )
}

export default Layout;