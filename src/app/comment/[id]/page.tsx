import { getCommentById } from "@lib/helpers/common"
import { getQueryClient, prefetchQuery } from "@lib/providers/queryClient"
import { getQueryKeys, refineSearchParams } from "@lib/utils"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import RepliesSection from "./RepliesSection"

type Props = {
    params: { id: string },
    searchParams: { p?: string, f?: string, t?: string }
}

const Page = async ({ params, searchParams }: Props) => {

    const cid = params.id.split('-')[0];

    const { filter, page } = refineSearchParams("comments", searchParams.p, searchParams.f)

    const queryClient = getQueryClient();

    await prefetchQuery({
        queryKey: getQueryKeys("comment_cid", { cid }),
        queryFn: () => getCommentById(cid),
        queryClient,
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <RepliesSection cid={cid} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default Page;