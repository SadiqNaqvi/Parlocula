import { getUserFromToken } from "@lib/auth/utils";
import { getManagers } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";

const ManagerPage = async ({ params: { id } }: { params: { id: string } }) => {

    const queryClient = getQueryClient();
    const tid = id.split('-')[0];
    const jar = cookies();
    const user = await getUserFromToken(jar);

    if (!user) return null;

    await queryClient.prefetchQuery({
        queryFn: () => queryFunction(getManagers, [tid, user.user_id, jar]),
        queryKey: getQueryKeys("threadManagers_tid", { tid }),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {/* <BannedList tid={tid} uid={user.user_id} /> */}
        </HydrationBoundary>
    )

}

export default ManagerPage;