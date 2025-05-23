import { getUserFromToken } from "@lib/auth/utils";
import ListPage from "./ListPage";
import { checkIfItemSaved, getItems, getList } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction, refineSearchParams } from "@lib/utils";
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query';
import { cookies } from "next/headers";

type Props = { params: { id: string }, searchParams: { p?: string, f?: string } };

export const generateStaticParams = async () => {
    return []
}

const Page = async ({ params: { id }, searchParams }: Props) => {

    const queryClient = getQueryClient();

    const { filter, page } = refineSearchParams("items", searchParams?.p, searchParams?.f);

    const lid = id.split('-')[0];

    const user = await getUserFromToken(cookies());

    await Promise.all([
        queryClient.prefetchInfiniteQuery({
            queryKey: getQueryKeys('itemsOfList_lid_filter_page', { lid, page, filter }),
            queryFn: () => queryFunction(getItems, [lid, page, filter], page),
            initialPageParam: page,
            staleTime: 60 * 60 * 1000,
            gcTime: 60 * 60 * 1000
        }),

        queryClient.prefetchQuery({
            queryKey: getQueryKeys("list_lid", { lid }),
            queryFn: () => queryFunction(getList, [lid]),
            staleTime: 60 * 60 * 1000,
            gcTime: 60 * 60 * 1000
        }),

        (user ?
            queryClient.prefetchQuery({
                queryKey: getQueryKeys("isContentSaved_type_id", { type: "list", id: lid }),
                queryFn: () => queryFunction(checkIfItemSaved, [lid, user.user_id]),
                staleTime: 60 * 60 * 1000,
                gcTime: 60 * 60 * 1000,
            }) :
            null
        ),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ListPage uid={user?.user_id} lid={lid} page={page} filter={filter} />
        </HydrationBoundary>
    )
}

export default Page;