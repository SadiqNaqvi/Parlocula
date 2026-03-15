import { FullPageLoadingSpinner } from "@components/ui/loading/LoadingSpinner";
import { getUserFromToken } from "@lib/auth/utils";
import { checkUserConnection, getCurrentUser, getRoomByUserId, getUserByUsername } from "@lib/helpers/common";
import { fetchQuery, getQueryClient, prefetchQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { PropsWithChildren, Suspense } from "react";
import Header from "./Header";
import { PullToRefresh, Sidebar } from "@components";
import { OptionalChildren } from "@components/ui";

export const generateMetadata = async ({ params }: { params: Promise<{ username: string }> }) => {

    const { username } = await params;

    const { result, success } = await getUserByUsername(username);

    if (!success || !result) return { title: "Parlocula" }

    return {
        title: `${username} - Parlocula`,
        description: result.bio || "No bio"
    }
}

const Fetcher = async ({ username, children }: PropsWithChildren<{ username: string }>) => {
    const queryClient = getQueryClient();

    const jar = await cookies();
    const user = await getUserFromToken(jar);

    const current = user?.username === username;

    const userKeys = getQueryKeys("user_username", { username });

    const rUser = await fetchQuery({
        queryKey: userKeys,
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
        <>
            <OptionalChildren condition={current}>
                <Sidebar />
            </OptionalChildren>
            <main>
                <HydrationBoundary state={dehydrate(queryClient)}>
                    <PullToRefresh>
                        <Header uid={user?.user_id} username={username} />
                        {children}
                    </PullToRefresh>
                </HydrationBoundary>
            </main>
        </>
    )
}

const Layout = async ({ children, params }: PropsWithChildren<{ params: Promise<{ username: string }> }>) => {
    const { username } = await params;
    return (
        <Suspense fallback={<FullPageLoadingSpinner path={[username]} />}>
            <Fetcher username={username}>{children}</Fetcher>
        </Suspense>
    )
}

export default Layout;