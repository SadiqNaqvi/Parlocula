import LoginModal from "@components/fallbacks/LoginModal";
import { getUserFromToken } from "@lib/auth/utils";
import { getBlockedUsers } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import BlockedList from "./BlockedList";
import { ParloPageProps } from "@type/other";

const BlockedUsersPage = async ({ searchParams }: ParloPageProps) => {

    const jar = await cookies();
    const user = await getUserFromToken(jar);
    const { p } = await searchParams;
    const queryClient = getQueryClient();

    if (!user) return (
        <LoginModal redirectTo="/settings/blocked" />
    );

    const page = parseInt(p || "1") || 1;

    await prefetchInfiniteQuery({
        queryClient,
        queryFn: () => getBlockedUsers(user.user_id, page, jar),
        initialPageParam: page,
        queryKey: getQueryKeys("blockedByCurrentUser_uid", { uid: user.user_id })
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <BlockedList />
        </HydrationBoundary>
    )
}

export default BlockedUsersPage;