import { NotFound } from "@components/ui";
import { getUserFromToken } from "@lib/auth/utils";
import { getItems, getShelf } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery, prefetchQuery } from "@lib/providers/queryClient";
import { getQueryKeys, isValidParloId, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { cookies } from "next/headers";
import EditShelfForm from "./EditShelfForm";

type Props = {
    params: { id: string },
    searchParams: { p?: string, f?: string, k?: string }
};

const Page = async ({ params: { id }, searchParams }: Props) => {

    const queryClient = getQueryClient();

    const { filter, page } = refineSearchParams("items", searchParams?.p, searchParams?.f);

    const key = searchParams?.k;
    const user = await getUserFromToken(cookies());

    const sid = id.split('-')[0];
    
    if (!isValidParloId(sid)) return (
        <NotFound
            title="Oops! Look's like you came across a wrong path."
            paras={["Content id is incorrect", "Please go back and try again."]}
        />
    );

    await Promise.all([
        prefetchInfiniteQuery({
            queryClient,
            queryKey: getQueryKeys('itemsOfShelf_sid_filter', { sid, filter }),
            queryFn: () => getItems(sid, user?.user_id, page, filter, key),
            initialPageParam: page,
        }),
        prefetchQuery({
            queryKey: getQueryKeys("shelf_sid", { sid }),
            queryFn: () => getShelf(sid, user?.user_id, key),
            queryClient,
        }),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <EditShelfForm id={id} />
        </HydrationBoundary>
    )
}

export default Page;