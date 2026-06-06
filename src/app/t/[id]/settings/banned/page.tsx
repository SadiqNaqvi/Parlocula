import { getUserFromToken } from "@lib/auth/utils";
import { getBannedMembers } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import BannedList from "./Banned";
import { ParloPageProps } from "@type/other";

const BannedPage = async ({ params }: ParloPageProps) => {

    const { id } = await params;

    const queryClient = getQueryClient();
    const tid = id.split('-')[0];
    const jar = await cookies();
    const user = await getUserFromToken(jar);

    if (!user) return null;

    await prefetchInfiniteQuery({
        queryFn: () => getBannedMembers(tid, user.user_id, 1, jar),
        queryKey: getQueryKeys("bannedMembers_tid", { tid }),
        initialPageParam: 1,
        queryClient,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <BannedList tid={tid} uid={user.user_id} />
        </HydrationBoundary>
    )

}

export default BannedPage;