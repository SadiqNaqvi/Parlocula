import { getUserFromToken } from "@lib/auth/utils";
import { getRoomByUserId, getUserMeta } from "@lib/helpers/common";
import { fetchQuery, getQueryClient } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import NewRoom from "./NewRoom";

const NewRoomPage = async ({ params }: { params: Promise<{ ruid: string }> }) => {

    const { ruid } = await params;

    const queryClient = getQueryClient();
    const jar = await cookies();
    const user = await getUserFromToken(jar);
    if (!user) return null;
    else if (ruid === user.user_id) redirect("/inbox");

    const [room, ruser] = await Promise.all([
        fetchQuery({
            queryClient,
            queryKey: getQueryKeys("roomExists_ruid_uid", { ruid, uid: user.user_id }),
            queryFn: () => getRoomByUserId(user.user_id, ruid, jar),
        }),
        fetchQuery({
            queryClient,
            queryKey: [`userMeta:${ruid}`],
            queryFn: () => getUserMeta(ruid),
        }),
    ]);

    if (room) redirect(`/inbox/${room._id}-${room.display_name ?? ""}`);
    else if (!ruser) redirect("inbox");

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <NewRoom ruser={ruser} />
        </HydrationBoundary>
    )
}

export default NewRoomPage;