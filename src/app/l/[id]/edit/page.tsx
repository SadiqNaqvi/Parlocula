import { getItems, getList } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction, refineSearchParams } from "@lib/utils";
import {
    dehydrate,
    HydrationBoundary
} from '@tanstack/react-query';
import EditListForm from "./EditListForm";

type Props = { params: { id: string }, searchParams: { p?: string, f?: string } };

const Page = async ({ params: { id }, searchParams }: Props) => {

    const queryClient = getQueryClient();
    const { filter, page } = refineSearchParams("items", searchParams?.p, searchParams?.f);

    const lid = id.split('-')[0];

    await Promise.all([
        queryClient.prefetchInfiniteQuery({
            queryKey: getQueryKeys('itemsOfList_lid_filter_page', { lid, page, filter }),
            queryFn: () => queryFunction(getItems, [lid, page, filter], page),
            initialPageParam: page,
            staleTime: 60 * 60 * 1000,
            gcTime: 60 * 60 * 1000
        }),

        queryClient.prefetchQuery({
            queryKey: getQueryKeys("list_lid", lid),
            queryFn: () => queryFunction(getList, [lid]),
            staleTime: 60 * 60 * 1000,
            gcTime: 60 * 60 * 1000
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <EditListForm lid={id} />
        </HydrationBoundary>
    )
}

export default Page;