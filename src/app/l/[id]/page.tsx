import { DynamicComponent } from "@components";
import { ListPage } from "@components/ui";
import { getList, getItems } from "@lib/helpers/common";
import { infiniteScrollerResponse, isValidObjectId, refineSearchParams } from "@lib/utils";
import { Metadata } from "next";
import {
    dehydrate,
    HydrationBoundary,
    QueryClient,
} from '@tanstack/react-query'

const queryClient = new QueryClient();

const getInitialListItems = async (id: string, page: number, filter: string) => {
    const { success, result, errCode } = await getItems(id, page, filter);
    if (!success) throw new Error(errCode);
    return infiniteScrollerResponse(result, page);
}

const getListAndItems = async ({ params, searchParams }: { params: { id: string }, searchParams: { p?: string, f?: string } }) => {
    const { id } = params;
    const { page, filter } = refineSearchParams("items", searchParams?.p, searchParams?.f);
    const list = getList(id);

    const items = queryClient.prefetchInfiniteQuery({
        queryKey: ['list', id],
        queryFn: () => getInitialListItems(id, page, filter),
        initialPageParam: page,
        staleTime: 60 * 60 * 1000
    });

    const [listRes] = await Promise.all([list, items])
    return listRes;
}

export const generateMetadata = async ({ params }: { params: { id: string } }): Promise<Metadata> => {
    const { id } = params;
    if (!isValidObjectId(id)) return { title: "Popcorn Paragon" };
    const { success, result } = await getList(id);
    if (!success) return { title: "Popcorn Paragon" };
    return {
        title: `${result.name} list ${result.username ? `by @${result.username}` : ""} - Popcorn Paragon`
    }
}

const Page = DynamicComponent((data, { searchParams }) => {
    const { filter } = refineSearchParams("items", searchParams?.p, searchParams?.f);
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <ListPage data={data} filter={filter} />
        </HydrationBoundary>
    )
}, getListAndItems)

export default Page;