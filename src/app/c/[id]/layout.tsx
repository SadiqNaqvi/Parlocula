import { NotFound } from "@components/ui";
import { getUserFromToken } from "@lib/auth/utils";
import { checkIfItemSaved, getCommentById, getVoteOnComment } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { createArray, getQueryKeys, isValidObjectId, queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { PropsWithChildren, Suspense } from "react";
import CommentHeader from "./Header";
import { FullPageLoadingSpinner } from "@components/ui/LoadingSpinner";

type Params = { params: { id: string } }

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {
    const cid = params.id.split('-')[0];
    if (!isValidObjectId(cid)) return { title: "Popcorn Paragon" }

    const { success, result } = await getCommentById(cid);
    if (!success || !result) return { title: "Popcorn Paragon" }
    const { username, content } = result;
    return { title: `Comment ${username ? `by ${username} ` : ''}- Popcorn Paragon`, description: content };
}

const Fetcher = async ({ cid, children }: PropsWithChildren<{ cid: string }>) => {

    const queryClient = getQueryClient();
    const jar = cookies();
    const user = await getUserFromToken(jar);
    await Promise.all(
        createArray([
            queryClient.prefetchQuery({
                queryKey: getQueryKeys("comment_cid", { cid }),
                queryFn: () => queryFunction(getCommentById, [cid])
            })
        ]).concatConditionally(user, (user) =>
            [
                queryClient.prefetchQuery({
                    queryKey: getQueryKeys("vote_cid", { cid }),
                    queryFn: () => queryFunction(getVoteOnComment, [cid, user.user_id, jar]),
                }),
                queryClient.prefetchQuery({
                    queryKey: getQueryKeys("isContentSaved_type_id", { type: "comment", id: cid }),
                    queryFn: () => queryFunction(checkIfItemSaved, [cid, user.user_id, jar]),
                }),
            ]
        )
    );

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <CommentHeader uid={user?.user_id} id={cid} />
            {children}
        </HydrationBoundary>
    )
}

const CommentLayout = async ({ children, params }: PropsWithChildren<Params>) => {

    const cid = params.id.split('-')[0];

    if (cid && !isValidObjectId(cid)) return (
        <NotFound
            title="Oops! Look's like you came across a wrong path."
            paras={["Content id is incorrect", "Please go back and try again."]}
        />
    );

    return (
        <main>
            <Suspense fallback={<FullPageLoadingSpinner />}>
                <Fetcher cid={cid}>{children}</Fetcher>
            </Suspense>
        </main>
    )
}

export default CommentLayout;