import { LoadingSpinner, ShowError } from "@components/ui";
import { getUserFromToken } from "@lib/auth/utils";
import { getInvitedRooms, getRooms } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { PropsWithChildren, Suspense } from "react";
import RoomList from "./RoomList";

const InboxLayout = async ({ children }: PropsWithChildren) => {

    const jar = cookies();
    const user = await getUserFromToken(jar);

    if (!user) return (
        <ShowError
            heading="Oops! You've been stopped by the Popcorn Cops"
            errCode="unauthenticated_access"
        />
    )

    const queryClient = getQueryClient();

    await queryClient.prefetchInfiniteQuery({
        queryFn: () => queryFunction(getRooms, [user.user_id, 1, jar], 1),
        queryKey: getQueryKeys("rooms_uid", { uid: user.user_id }),
        initialPageParam: 1
    });

    queryClient.prefetchInfiniteQuery({
        queryFn: () => queryFunction(getInvitedRooms, [user.user_id, 1, jar], 1),
        queryKey: getQueryKeys("roomInvitations_uid", { uid: user.user_id }),
        initialPageParam: 1,
    });

    return (
        <main style={{ paddingBottom: 0 }} className="flex noControl">
            <HydrationBoundary state={dehydrate(queryClient)}>
                <RoomList uid={user.user_id} />
                <Suspense fallback={<section className="mt-8"><LoadingSpinner /></section>}>
                    {children}
                </Suspense>
            </HydrationBoundary>
        </main>
    )
}

export default InboxLayout;