import FilterTiles from "@components/Router/FilterTIles";
import { getCommentsOnPost } from "@lib/helpers/common";
import { getQueryClient, prefetchInfiniteQuery } from "@lib/providers/queryClient";
import { getQueryKeys, isValidParloId, refineSearchParams } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import CommentSection from "./tabs/CommentSection";
import { getUserFromToken } from "@lib/auth/utils";
import { cookies } from "next/headers";

type Props = { params: { id: string }, searchParams: { p?: string, f?: string } };

const Page = async ({ params, searchParams }: Props) => {

    const queryClient = getQueryClient();

    const { id } = params;

    const pid = id.split('-')[0];
    if (pid && !isValidParloId(pid)) return null;

    const { filter, page } = refineSearchParams("comments", searchParams.p, searchParams.f);

    const user = await getUserFromToken(cookies());

    const allowNsfw = user ? !user.filterContent : false;

    await prefetchInfiniteQuery({
        queryClient,
        queryKey: getQueryKeys('commentsOfPost_pid_filter', { pid, filter }),
        queryFn: () => getCommentsOnPost(pid, page, filter, allowNsfw),
        initialPageParam: page,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <section className="my-6">
                <FilterTiles type="comments" />
            </section>
            <CommentSection allowNSFW={allowNsfw} filter={filter} id={pid} page={page} />
        </HydrationBoundary>
    )
}

export default Page;