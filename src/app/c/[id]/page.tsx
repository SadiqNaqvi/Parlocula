import { checkIfItemSaved, getCommentById, getVoteOnComment } from "@lib/helpers/common"
import { getQueryKeys, isValidObjectId, queryFunction, refineSearchParams } from "@lib/utils"
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query"
import { MereComment } from "@type/internal"
import { Metadata } from "next"
import CommentPage from "./CommentPage"
import { getQueryClient } from "@lib/queryClient"
import { getUserFromToken } from "@lib/auth"
import { cookies } from "next/headers"

export const generateMetadata = async ({ params }: { params: { id: string } }): Promise<Metadata> => {
    const cid = params.id.split('-')[0];
    if (!isValidObjectId(cid))
        return { title: "Popcorn Paragon" }

    const { success, result } = await getCommentById(cid);
    if (!success || !result) return { title: "Popcorn Paragon" }
    const { username, content } = result as MereComment;
    return { title: `Comment ${username ? `by ${username} ` : ''}- Popcorn Paragon`, description: content };
}

export const generateStaticParams = async () => {
    return []
}

const Page = async ({ params, searchParams }: { params: { id: string }, searchParams: { p?: string, f?: string, t?: string } }) => {

    const queryClient = getQueryClient();

    const cid = params.id.split('-')[0];
    const user = await getUserFromToken(cookies());

    const { filter, page } = refineSearchParams("comments", searchParams.p, searchParams.f)

    // Prefetching all the data that the current page need.
    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: getQueryKeys("comment_cid", { cid }),
            queryFn: () => queryFunction(getCommentById, [cid]),
            staleTime: 60 * 60 * 1000,
            gcTime: 60 * 60 * 1000
        }),
        ...(user ? [
            queryClient.prefetchQuery({
                queryKey: getQueryKeys("vote_cid", { cid }),
                queryFn: () => queryFunction(getVoteOnComment, [cid, user.user_id]),
                staleTime: 60 * 60 * 1000,
                gcTime: 60 * 60 * 1000
            }),
            queryClient.prefetchQuery({
                queryKey: getQueryKeys("isContentSaved_type_id", { type: "comment", id: cid }),
                queryFn: () => queryFunction(checkIfItemSaved, [cid, user.user_id]),
                staleTime: 60 * 60 * 1000,
                gcTime: 60 * 60 * 1000
            }),
        ] : []),
    ]);

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <CommentPage cid={cid} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default Page;