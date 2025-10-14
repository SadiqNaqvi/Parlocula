import { getUserFromToken } from "@lib/auth/utils";
import { getBannedMembers } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import BannedList from "./Banned";

const BannedPage = async ({ params: { id } }: { params: { id: string } }) => {

    const queryClient = getQueryClient();
    const tid = id.split('-')[0];
    const jar = cookies();
    const user = await getUserFromToken(jar);

    if (!user) return null;

    await queryClient.prefetchInfiniteQuery({
        queryFn: () => queryFunction(getBannedMembers, [tid, user.user_id, jar]),
        queryKey: getQueryKeys("bannedMembers_tid", { tid }),
        initialPageParam: 1,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <BannedList tid={tid} uid={user.user_id} />
        </HydrationBoundary>
    )

}

export default BannedPage;