import { getQuotesOfPost } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys, isValidParloId } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import QuoteSection from "../tabs/QuoteSection";
import { getUserFromToken } from "@lib/auth/utils";
import { cookies } from "next/headers";

const QuotesPage = async ({ params, searchParams }: { params: { id: string }, searchParams: { p?: string, f?: string } }) => {

    const queryClient = getQueryClient();

    const { id } = params;

    const pid = id.split('-')[0];
    if (pid && !isValidParloId(pid)) return null;

    const page = parseInt(searchParams.p || "1") || 1;

    const user = await getUserFromToken(cookies());

    const allowNsfw = user ? !user.filterContent : false;

    await prefetchInfiniteQuery({
        queryClient,
        queryKey: getQueryKeys('quotes_pid', { pid }),
        queryFn: () => getQuotesOfPost(pid, page, allowNsfw),
        initialPageParam: page,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <QuoteSection allowNsfw={allowNsfw} id={pid} page={page} />
        </HydrationBoundary>
    )
}

export default QuotesPage;