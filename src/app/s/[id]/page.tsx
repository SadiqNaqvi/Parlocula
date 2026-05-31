import { getUserFromToken } from "@lib/auth/utils";
import { checkIfItemSaved, getItems, getShelf, getShelfConnection } from "@lib/helpers/common";
import { fetchInfiniteQuery, fetchQuery, getQueryClient, prefetchInfiniteQuery, prefetchQuery } from "@lib/providers/queryClient";
import { createArray, getQueryKeys, isValidParloId, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { cookies } from "next/headers";
import ShelfPage from "./ShelfPage";
import { ParloPageProps } from "@type/other";
import { Metadata } from "next";
import JsonLd from "@components/JsonLd";
import { generateJsonLdForShelf } from "@lib/seo/jsonld";

export const generateMetadata = async ({ params, searchParams }: ParloPageProps): Promise<Metadata> => {
    const { id } = await params;
    const lid = id.split('+')[0];

    if (!isValidParloId(lid)) return { title: { absolute: "Parlocula - The Cinematic Planet" } };

    const jar = await cookies();
    const user = await getUserFromToken(jar);

    const sp = await searchParams;
    const key = sp.k || sp.key;

    const { success, result } = await getShelf(lid, user?.user_id, key, jar);
    if (!success || !result) return { title: "Parlocula" };

    const { name, item_count, username } = result;

    return {
        title: `${name} - Shelf ${username ? `by @${username} ` : ''}`,
        description: `${name}${username ? ` by @${username}` : ''}. Explore ${item_count} curated movies and shows collected on Parlocula.`
    }

}

const Page = async ({ params, searchParams }: ParloPageProps) => {

    const { id } = await params;
    const sp = await searchParams;

    const queryClient = getQueryClient();

    const sid = id.split('+')[0];

    const { filter, page } = refineSearchParams("items", sp.p, sp.f);
    const key = sp.k || sp.key;
    const jar = await cookies();
    const user = await getUserFromToken(jar);

    const [shelf, items] = await Promise.all(
        createArray<any>([
            fetchQuery({
                queryClient,
                queryKey: getQueryKeys("shelf_sid", { sid }),
                queryFn: () => getShelf(sid, user?.user_id, key, jar),
            }),
            fetchInfiniteQuery({
                queryClient,
                queryKey: getQueryKeys('itemsOfShelf_sid_filter', { sid, filter }),
                queryFn: () => getItems(sid, user?.user_id, page, filter, key, jar),
                initialPageParam: page,
            })
        ]).concatConditionally(user?.user_id, (uid) => [
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

        ])
    );
    const jsonLd = shelf ? generateJsonLdForShelf(shelf, items.data || []) : null;

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>

            <JsonLd schemas={jsonLd} />

            <ShelfPage uid={user?.user_id} key={key} id={sid} page={page} filter={filter} />
        </HydrationBoundary>
    )
}

export default Page;