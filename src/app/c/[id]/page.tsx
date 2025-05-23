import { NotFound } from "@components/ui"
import { getUserFromToken } from "@lib/auth/utils"
import { checkIfItemSaved, getCommentById, getVoteOnComment } from "@lib/helpers/common"
import { getQueryClient } from "@lib/queryClient"
import { getQueryKeys, isValidObjectId, queryFunction, refineSearchParams } from "@lib/utils"
import { dehydrate, HydrationBoundary } from "@tanstack/react-query"
import { MereComment } from "@type/internal"
import { Metadata } from "next"
import { cookies } from "next/headers"
import CommentPage from "./CommentPage"

export const generateMetadata = async ({ params }: { params: { id: string } }): Promise<Metadata> => {
    const cid = params.id.split('-')[0];
    if (!isValidObjectId(cid))
        return { title: "Popcorn Paragon" }

    const { success, result } = await getCommentById(cid);
    if (!success || !result) return { title: "Popcorn Paragon" }
    const { username, content } = result as MereComment;
    return { title: `Comment ${username ? `by ${username} ` : ''}- Popcorn Paragon`, description: content };
}

const Page = async ({ params, searchParams }: { params: { id: string }, searchParams: { p?: string, f?: string, t?: string } }) => {

    const queryClient = getQueryClient();

    const cid = params.id.split('-')[0];

    if (cid && !isValidObjectId(cid)) return (
        <NotFound
            title="Oops! Look's like you came across a wrong path."
            paras={["Content id is incorrect", "Please go back and try again."]}
        />
    );

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
            <CommentPage id={cid} filter={filter} page={page} />
        </HydrationBoundary>
    )
}

export default Page;