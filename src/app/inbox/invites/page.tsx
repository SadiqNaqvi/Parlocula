import { getUserFromToken } from "@lib/auth/utils";
import { getInvitedRooms } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import RoomInvitationList from "./RoomInvitationList";

const InvitePage = async () => {

    const queryClient = getQueryClient();
    const jar = cookies();
    const user = await getUserFromToken(jar);
    if (!user) return null;

    await queryClient.prefetchInfiniteQuery({
        queryFn: () => queryFunction(getInvitedRooms, [user.user_id, 1, jar]),
        queryKey: getQueryKeys("roomInvitations_uid", { uid: user.user_id, }),
        initialPageParam: 1
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <RoomInvitationList uid={user.user_id} />
        </HydrationBoundary>
    )

}

export default InvitePage;