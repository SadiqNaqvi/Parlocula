import { getUserFromToken } from "@lib/auth/utils";
import { getShelvesOfUser } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import ShelfList from "../ShelfList";
import { ParloPageProps } from "@type/other";

const PrivateShelvesPage = async ({ searchParams }: ParloPageProps) => {

    const user = await getUserFromToken(await cookies());
    if (!user) return null;

    const { user_id } = user;
    const { f } = await searchParams;
    const { filter } = refineSearchParams("shelves", "1", f);

    const queryClient = getQueryClient();

    await prefetchInfiniteQuery({
        queryClient,
        queryFn: () => getShelvesOfUser(user_id, 1, filter),
        queryKey: getQueryKeys("shelvesOfUser_uid_filter", { uid: user_id, filter })
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ShelfList
                title="Private Shelves"
                type="private"
                uid={user_id}
                filter={filter}
            />
        </HydrationBoundary>
    )

}

export default PrivateShelvesPage;