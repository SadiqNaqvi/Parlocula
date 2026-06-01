import { getUserFromToken } from "@lib/auth/utils";
import { getAllShelvesOfUser } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import ShelfList from "../ShelfList";

const AllShelfPage = async () => {

    const jar = await cookies();
    const user = await getUserFromToken(jar)

    if (!user) return;

    const queryClient = getQueryClient();

    await prefetchInfiniteQuery({
        queryClient,
        queryFn: () => getAllShelvesOfUser(user.user_id, 1, jar),
        queryKey: getQueryKeys("allShelvesOfUser_uid", { uid: user.user_id })
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ShelfList
                title="All Shelves"
                type="all"
                uid={user.user_id}
            />
        </HydrationBoundary>
    )

}

export default AllShelfPage;