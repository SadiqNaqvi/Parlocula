import LoginModal from "@components/fallbacks/LoginModal";
import { LoadingSpinner } from "@components/ui";
import { getUserFromToken } from "@lib/auth/utils";
import { getInvitedRooms, getRooms } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { PropsWithChildren, Suspense } from "react";
import RoomList from "./RoomList";

const InboxLayout = async ({ children }: PropsWithChildren) => {

    const jar = await cookies();
    const user = await getUserFromToken(jar);

    if (!user) return (
        <LoginModal redirectTo="/inbox" />
    )

    const queryClient = getQueryClient();

    await prefetchInfiniteQuery({
        queryClient,
        queryFn: () => getRooms(user.user_id, 1, jar),
        queryKey: getQueryKeys("rooms_uid", { uid: user.user_id }),
    });

    prefetchInfiniteQuery({
        queryClient,
        queryFn: () => getInvitedRooms(user.user_id, 1, jar),
        queryKey: getQueryKeys("roomInvitations_uid", { uid: user.user_id }),
    });

    return (
        <main className="flex noPadding fullScreen">
            <HydrationBoundary state={dehydrate(queryClient)}>
                <RoomList uid={user.user_id} />
                <Suspense fallback={<LoadingSpinner className="mt-8" />}>
                    {children}
                </Suspense>
            </HydrationBoundary>
        </main>
    )
}

export default InboxLayout;