import FilterTiles from "@components/FilterTiles";
import { getShelvesOfUser, getUserByUsername } from "@lib/helpers/common";
import { fetchQuery, getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ParloPageProps } from "@type/other";
import ShelfSection from "../tabs/ShelfSection";
import { getUserFromToken } from "@lib/auth/utils";
import { cookies } from "next/headers";

const Page = async ({ params, searchParams }: ParloPageProps) => {

    const queryClient = getQueryClient();

    const currentUser = await getUserFromToken(await cookies());

    const { username } = await params;
    const { f, p } = await searchParams;

    const user = await fetchQuery({
        queryClient,
        queryFn: () => getUserByUsername(username),
        queryKey: getQueryKeys("user_username", { username }),
    });

    if (!user) return null;

    const uid = user._id;

    const { filter, page } = refineSearchParams("shelves", p, f);

    await prefetchInfiniteQuery({
        queryClient,
        queryKey: getQueryKeys("shelvesOfUser_uid_filter", { uid, filter }),
        queryFn: () => getShelvesOfUser(uid, page, filter),
        initialPageParam: page,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <div className="my-2">
                <FilterTiles type="shelves" />
            </div>
            <ShelfSection current={Boolean(currentUser && user._id === currentUser.user_id)} user={user} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default Page;