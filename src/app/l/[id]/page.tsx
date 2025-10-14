import { getUserFromToken } from "@lib/auth/utils";
import { checkIfItemSaved, getItems, getList } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { createArray, getQueryKeys, queryFunction, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { cookies } from "next/headers";
import ListPage from "./ListPage";

type Props = { params: { id: string }, searchParams: { p?: string, f?: string, k?: string } };

const Page = async ({ params: { id }, searchParams }: Props) => {

    const queryClient = getQueryClient();

    const lid = id.split('-')[0];

    const { filter, page } = refineSearchParams("items", searchParams?.p, searchParams?.f);
    const key = searchParams.k;
    const jar = cookies();
    const user = await getUserFromToken(jar);

    await Promise.all(
        createArray(
            [
                queryClient.prefetchQuery({
                    queryKey: getQueryKeys("list_lid", { lid }),
                    queryFn: () => queryFunction(getList, [lid, user?.user_id ?? "undefined", key]),
                }),
                queryClient.prefetchInfiniteQuery({
                    queryKey: getQueryKeys('itemsOfList_lid_filter', { lid, filter }),
                    queryFn: () => queryFunction(getItems, [lid, user?.user_id ?? "undefined", page, filter, key], page),
                    initialPageParam: page,
                })
            ]
        )
            .concatConditionally(user, (u) =>
                queryClient.prefetchQuery({
                    queryKey: getQueryKeys("isContentSaved_type_id", { type: "list", id: lid }),
                    queryFn: () => queryFunction(checkIfItemSaved, [lid, u.user_id, jar]),
                })
            )
    );

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ListPage uid={user?.user_id} key={key} id={lid} page={page} filter={filter} />
        </HydrationBoundary>
    )
}

export default Page;