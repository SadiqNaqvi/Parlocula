import { getUserFromToken } from "@lib/auth/utils";
import { getShelvesOfUser } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import ShelfList from "../ShelfList";

const PublicShelvesPage = async ({ searchParams }: { searchParams?: { f?: string } }) => {

    const user = await getUserFromToken(cookies());
    if (!user) return null;

    const { user_id } = user;

    const { filter } = refineSearchParams("shelves", "1", searchParams?.f);


    const queryClient = getQueryClient();

    await prefetchInfiniteQuery({
        queryClient,
        queryFn: () => getShelvesOfUser(user_id, 1, filter),
        queryKey: getQueryKeys("shelvesOfUser_uid_filter", { uid: user_id, filter })
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ShelfList
                title="Public Shelves"
                type="public"
                uid={user_id}
                filter={filter}
            />
        </HydrationBoundary>
    )

}

export default PublicShelvesPage;