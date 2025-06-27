import { NotFound } from "@components/ui";
import { getUserFromToken } from "@lib/auth/utils";
import { checkIfItemSaved, getItems, getList } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, isValidObjectId, queryFunction, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { cookies } from "next/headers";
import ListPage from "./ListPage";

type Props = { params: { id: string }, searchParams: { p?: string, f?: string } };

const Page = async ({ params: { id }, searchParams }: Props) => {

    const queryClient = getQueryClient();

    const lid = id.split('-')[0];
    if (lid && !isValidObjectId(lid)) return (
        <NotFound
            title="Oops! Look's like you came across a wrong path."
            paras={["Content id is incorrect", "Please go back and try again."]}
        />
    );

    const { filter, page } = refineSearchParams("items", searchParams?.p, searchParams?.f);

    const jar = cookies();
    const user = await getUserFromToken(jar);

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
                queryFn: () => queryFunction(checkIfItemSaved, [lid, user.user_id, jar]),
                staleTime: 60 * 60 * 1000,
                gcTime: 60 * 60 * 1000,
            }) :
            null
        ),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ListPage uid={user?.user_id} id={lid} page={page} filter={filter} />
        </HydrationBoundary>
    )
}

export default Page;