import LoginModal from "@components/fallbacks/LoginModal";
import { getUserFromToken } from "@lib/auth/utils";
import { getFollowers } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import FollowerList from "./FollowerList";

const FollowersPage = async ({ searchParams: { p } }: { searchParams: { p?: string } }) => {

    const jar = cookies();
    const user = await getUserFromToken(jar);

    const queryClient = getQueryClient();

    if (!user) return (
        <LoginModal redirectTo="/settings/followers" />
    );

    const page = parseInt(p || "1") || 1;

    await prefetchInfiniteQuery({
        queryClient,
        queryFn: () => getFollowers(user.user_id, page, jar),
        initialPageParam: page,
        queryKey: getQueryKeys("followersOfCurrentUser_uid", { uid: user.user_id })
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <FollowerList />
        </HydrationBoundary>
    )
}

export default FollowersPage;