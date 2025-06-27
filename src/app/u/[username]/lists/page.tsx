import { getListsOfUser } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import Lists from "../tabs/ListSection";

type Props = { params: { username: string }, searchParams: { p?: string, f?: string, t?: string } }

const Page = async ({ params: { username }, searchParams: { f, p } }: Props) => {

    const queryClient = getQueryClient();

    const { filter, page } = refineSearchParams("lists", p, f);
    
    await queryClient.prefetchInfiniteQuery({
        queryKey: getQueryKeys("listsOfUser_username_filter", { username, filter }),
        queryFn: () => queryFunction(getListsOfUser, [username, page, filter], page),
        initialPageParam: page,
        staleTime: 60 * 60 * 1000,
        gcTime: 60 * 60 * 1000
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Lists username={username} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default Page;