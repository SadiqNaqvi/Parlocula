import { getUserFromToken } from "@lib/auth/utils";
import { checkIfItemSaved, getItems, getShelf, getShelfConnection } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery, prefetchQuery } from "@lib/providers/queryClient";
import { createArray, getQueryKeys, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { cookies } from "next/headers";
import ShelfPage from "./ShelfPage";
import { ParloPageProps } from "@type/other";

const Page = async ({ params, searchParams }: ParloPageProps) => {

    const { id } = await params;
    const sp = await searchParams;

    const queryClient = getQueryClient();

    const sid = id.split('-')[0];

    const { filter, page } = refineSearchParams("items", sp.p, sp.f);
    const key = sp.k;
    const jar = await cookies();
    const user = await getUserFromToken(jar);

    await Promise.all(
        createArray(
            [
                prefetchQuery({
                    queryClient,
                    queryKey: getQueryKeys("shelf_sid", { sid }),
                    queryFn: () => getShelf(sid, user?.user_id, key),
                }),
                prefetchInfiniteQuery({
                    queryClient,
                    queryKey: getQueryKeys('itemsOfShelf_sid_filter', { sid, filter }),
                    queryFn: () => getItems(sid, user?.user_id ?? "undefined", page, filter, key),
                    initialPageParam: page,
                })
            ]
        )
            .concatConditionally(user?.user_id, (uid) =>
                [
                    prefetchQuery({
                        queryClient,
                        queryKey: getQueryKeys("isContentSaved_type_id", { type: "shelf", id: sid }),
                        queryFn: () => checkIfItemSaved(sid, uid, jar),
                    }),
                    prefetchQuery({
                        queryClient,
                        queryKey: getQueryKeys("shelfConnection_sid", { sid }),
                        queryFn: () => getShelfConnection(uid, sid, jar),
                    }),

                ]
            )
    );

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ShelfPage uid={user?.user_id} key={key} id={sid} page={page} filter={filter} />
        </HydrationBoundary>
    )
}

export default Page;