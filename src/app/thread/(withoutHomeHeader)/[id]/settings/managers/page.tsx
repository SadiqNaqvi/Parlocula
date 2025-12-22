import { getUserFromToken } from "@lib/auth/utils";
import { getManagers } from "@lib/helpers/common";
import { getQueryClient, prefetchQuery } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { cookies } from "next/headers";
import Managers from "./Managers";

const ManagerPage = async ({ params: { id } }: { params: { id: string } }) => {

    const queryClient = getQueryClient();
    const tid = id.split('-')[0];
    const jar = cookies();
    const user = await getUserFromToken(jar);

    if (!user) return null;

    await prefetchQuery({
        queryClient,
        queryFn: () => getManagers(tid, user.user_id, jar),
        queryKey: getQueryKeys("threadManagers_tid", { tid }),
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Managers tid={tid} />
        </HydrationBoundary>
    )

}

export default ManagerPage;