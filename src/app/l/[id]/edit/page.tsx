import { getItems, getList } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, isValidObjectId, queryFunction, refineSearchParams } from "@lib/utils";
import {
    dehydrate,
    HydrationBoundary
} from '@tanstack/react-query';
import EditListForm from "./EditListForm";
import { NotFound } from "@components/ui";

type Props = { params: { id: string }, searchParams: { p?: string, f?: string } };

const Page = async ({ params: { id }, searchParams }: Props) => {

    const queryClient = getQueryClient();
    const { filter, page } = refineSearchParams("items", searchParams?.p, searchParams?.f);

    const lid = id.split('-')[0];
    if (lid && !isValidObjectId(lid)) return (
        <NotFound
            title="Oops! Look's like you came across a wrong path."
            paras={["Content id is incorrect", "Please go back and try again."]}
        />
    );

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
            <EditListForm id={id} />
        </HydrationBoundary>
    )
}

export default Page;