import { getUserFromToken } from "@lib/auth/utils";
import { getRoomByUserId, getUserMeta } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { FullRoomType, MereUser } from "@type/internal";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import NewRoom from "./NewRoom";

const NewRoomPage = async ({ params: { ruid } }: { params: { ruid: string } }) => {

    const queryClient = getQueryClient();
    const jar = cookies();
    const user = await getUserFromToken(jar);
    if (!user) return null;
    else if (ruid === user.user_id) redirect("/inbox");

    const [room, ruser] = await Promise.all([
        queryClient.fetchQuery({
            queryKey: getQueryKeys("roomExists_ruid_uid", { ruid, uid: user.user_id }),
            queryFn: () => queryFunction(getRoomByUserId, [user.user_id, ruid, jar]) as Promise<FullRoomType> | null,
            staleTime: 60 * 60 * 1000,
            gcTime: 60 * 60 * 1000,
        }),
        queryClient.fetchQuery({
            queryKey: [`userMeta:${ruid}`],
            queryFn: () => queryFunction(getUserMeta, [ruid]) as Promise<MereUser>,
        }),
    ]);

    if (room) redirect(`/inbox/${room._id}-${room.display_name ?? ""}`);
    else if (!ruser) redirect("inbox");

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <NewRoom ruser={ruser} user={user} />
        </HydrationBoundary>
    )
}

export default NewRoomPage;