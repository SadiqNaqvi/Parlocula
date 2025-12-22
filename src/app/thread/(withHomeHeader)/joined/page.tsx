import LoginModal from "@components/fallbacks/LoginModal";
import { getUserFromToken } from "@lib/auth/utils";
import { joinedThreadsOfUser } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import ThreadList from "../ThreadList";

const Page = async ({ searchParams }: { searchParams: { p?: string } }) => {

    const jar = cookies();
    const user = await getUserFromToken(jar);

    if (!user) return (
        <LoginModal redirectTo="/thread/joined" />
    );

    const queryClient = getQueryClient();
    const page = parseInt(searchParams.p || "1") || 1;

    prefetchInfiniteQuery({
        queryClient,
        queryFn: () => joinedThreadsOfUser(user.user_id, page),
        queryKey: getQueryKeys("joinedThreadsOfUser_uid", { uid: user.user_id }),
        initialPageParam: page,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ThreadList section="joined" />
        </HydrationBoundary>
    )
}

export default Page;