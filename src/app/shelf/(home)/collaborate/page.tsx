import { getUserFromToken } from "@lib/auth/utils";
import { getShelvesAsCollaborator } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import ShelfList from "../ShelfList";

const CollaborativeShelvesPage = async () => {

    const user = await getUserFromToken(cookies());
    if (!user) return null;

    const { user_id } = user;
    const queryClient = getQueryClient();

    await prefetchInfiniteQuery({
        queryClient,
        queryFn: () => getShelvesAsCollaborator(user_id, 1),
        queryKey: getQueryKeys("collaboratedShelvesOfUser_uid", { uid: user_id })
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ShelfList
                title="Collaborative Shelves"
                type="collaborative"
                uid={user_id}
            />
        </HydrationBoundary>
    )

}

export default CollaborativeShelvesPage;