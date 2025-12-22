import { FullPageLoadingSpinner } from "@components/ui/loading/LoadingSpinner";
import { getUserFromToken } from "@lib/auth/utils";
import { checkUserConnection, getCurrentUser, getRoomByUserId, getUserByUsername } from "@lib/helpers/common";
import { fetchQuery, getQueryClient, prefetchQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { PropsWithChildren, Suspense } from "react";
import Header from "./Header";

export const generateMetadata = async ({ params: { username } }: { params: { username: string } }) => {

    const { result, success } = await getUserByUsername(username);

    if (!success || !result) return { title: "Parlocula" }

    return {
        title: `${username} - Parlocula`,
        description: result.bio || "No bio"
    }
}

const Fetcher = async ({ username, children }: PropsWithChildren<{ username: string }>) => {
    const queryClient = getQueryClient();

    const jar = cookies();
    const user = await getUserFromToken(jar);

    const current = user?.username === username;

    const userKeys = getQueryKeys("user_username", { username });

    const rUser = await fetchQuery({
        queryKey: userKeys,
        // queryFn: () => user && current ? getCurrentUser(user.user_id, jar) : getUserByUsername(username),
        queryFn: () => getUserByUsername(username),
        queryClient,
    });

    if (user && rUser && !current)
        await Promise.all([
            prefetchQuery({
                queryClient,
                queryKey: getQueryKeys("connection_ruid", { ruid: rUser._id }),
                queryFn: () => checkUserConnection(user.user_id, rUser._id, jar),
            }),
            prefetchQuery({
                queryClient,
                queryKey: getQueryKeys("roomExists_ruid_uid", { ruid: rUser._id, uid: user.user_id }),
                queryFn: () => getRoomByUserId(user.user_id, rUser._id, jar),
            }),
        ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Header uid={user?.user_id} username={username} />
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