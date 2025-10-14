import { NotFound } from "@components/ui"
import { checkIfItemSaved, getCommentById, getVoteOnComment } from "@lib/helpers/common"
import { createArray, getQueryKeys, isValidObjectId, queryFunction, refineSearchParams } from "@lib/utils"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import RepliesSection from "./RepliesSection"
import { getQueryClient } from "@lib/queryClient"

const Page = async ({ params, searchParams }: { params: { id: string }, searchParams: { p?: string, f?: string, t?: string } }) => {
    const cid = params.id.split('-')[0];

    if (cid && !isValidObjectId(cid)) return (
        <NotFound
            title="Oops! Look's like you came across a wrong path."
            paras={["Content id is incorrect", "Please go back and try again."]}
        />
    );

    const { filter, page } = refineSearchParams("comments", searchParams.p, searchParams.f)

   const queryClient = getQueryClient();

    queryClient.prefetchQuery({
        queryKey: getQueryKeys("comment_cid", { cid }),
        queryFn: () => queryFunction(getCommentById, [cid]),
        staleTime: 60 * 60 * 1000,
        gcTime: 60 * 60 * 1000
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <RepliesSection id={cid} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default Page;