import { getShelvesOfUser, getUserByUsername } from "@lib/helpers/common";
import { fetchQuery, getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import ShelfSection from "../tabs/ShelfSection";
import FilterTiles from "@components/Router/FilterTIles";

type Props = { params: { username: string }, searchParams: { p?: string, f?: string, t?: string } }

const Page = async ({ params: { username }, searchParams: { f, p } }: Props) => {

    const queryClient = getQueryClient();

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
            <ShelfSection user={user} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default Page;