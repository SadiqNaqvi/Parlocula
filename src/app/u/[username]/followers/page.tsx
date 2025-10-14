import { ShowError } from "@components/ui";
import { getUserFromToken } from "@lib/auth/utils";
import { getFollowers } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import FollowList from "../FollowList";

const FollowersPage = async ({ searchParams: { p } }: { searchParams: { p?: string } }) => {

    const jar = cookies();
    const user = await getUserFromToken(jar);

    const queryClient = getQueryClient();

    if (!user) return (
        <section className="size-screen">
            <ShowError
                heading="Oops! You have been stopped by Popcorn Cops"
                errCode="unauthenticated_access"
            />
        </section>
    );

    const page = parseInt(p || "1") || 1;

    await queryClient.prefetchInfiniteQuery({
        queryFn: () => queryFunction(getFollowers, [user.user_id, page, jar]),
        initialPageParam: page,
        queryKey: getQueryKeys("followersOfCurrentUser_uid", { uid: user.user_id })
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <FollowList type="followers" uid={user.user_id} />
        </HydrationBoundary>
    )
}

export default FollowersPage;