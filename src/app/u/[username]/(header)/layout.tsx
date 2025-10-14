import { FullPageLoadingSpinner } from "@components/ui/LoadingSpinner";
import { getUserFromToken } from "@lib/auth/utils";
import { checkUserConnection, getCurrentUser, getRoomByUserId, getUserByUsername } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { PropsWithChildren, Suspense } from "react";
import Header from "./Header";
import { RequestedUser, User } from "@type/internal";
import { CookiesType } from "@type/other";

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

    const queryFn = current ? getCurrentUser : getUserByUsername;
    const props: [id: string, cookies?: CookiesType | undefined] = current ? [user.user_id, jar] : [username];

    const userKeys = getQueryKeys("user_username", { username });

    console.log("prefetched", queryClient.getQueryData(userKeys));

    const rUser = await queryClient.fetchQuery<RequestedUser | User>({
        queryKey: userKeys,
        queryFn: () => queryFunction(queryFn, props) as Promise<RequestedUser | User>,
        staleTime: 60 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
    });

    // const presence = await getAblyRealtime().channels.get(rUser._id).presence.get();
    // console.log("is online", Boolean(presence.length), presence);

    if (user && rUser && !current)
        await Promise.all([
            queryClient.prefetchQuery({
                queryKey: getQueryKeys("connection_ruid", { ruid: rUser._id }),
                queryFn: () => queryFunction(checkUserConnection, [user.user_id, rUser._id, jar]),
                staleTime: 60 * 60 * 1000,
                gcTime: 60 * 60 * 1000,
            }),
            queryClient.prefetchQuery({
                queryKey: getQueryKeys("roomExists_ruid_uid", { ruid: rUser._id, uid: user.user_id }),
                queryFn: () => queryFunction(getRoomByUserId, [user.user_id, rUser._id, jar]),
                staleTime: 60 * 60 * 1000,
                gcTime: 60 * 60 * 1000,
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