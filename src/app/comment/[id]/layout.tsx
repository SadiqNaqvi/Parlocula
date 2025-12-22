import { ContentFiltered, NotFound } from "@components/fallbacks";
import { FullPageLoadingSpinner } from "@components/ui/loading/LoadingSpinner";
import { getUserFromToken } from "@lib/auth/utils";
import { checkIfItemSaved, checkIfReportExists, getCommentById, checkLikeOnComment } from "@lib/helpers/common";
import { fetchQuery, getQueryClient, prefetchQuery } from "@lib/providers/queryClient";
import { calculateAge, getQueryKeys, isValidParloId } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { PropsWithChildren, Suspense } from "react";
import CommentHeader from "./Header";

type Params = { params: { id: string } }

export const generateMetadata = async ({ params }: Params): Promise<Metadata> => {

    const cid = params.id.split('-')[0];

    if (!isValidParloId(cid))
        return { title: "Parlocula" }

    const { success, result } = await getCommentById(cid);

    if (!success || !result)
        return { title: "Parlocula" }

    const { username, content } = result;

    return {
        title: `Comment by ${username || "Parlocula User"} - Parlocula`,
        description: content
    };
}

const Fetcher = async ({ cid, children }: PropsWithChildren<{ cid: string }>) => {

    const queryClient = getQueryClient();

    const jar = cookies();

    const user = await getUserFromToken(jar);

    const comment = await fetchQuery({
        queryKey: getQueryKeys("comment_cid", { cid }),
        queryFn: () => getCommentById(cid),
        queryClient,
    });

    // If comment is not found or if comment contains NSFW and user is below 18, show Not Found.
    if (!comment || (comment.nsfw && user && calculateAge(user.dob) < 18)) return (
        <NotFound
            title="Oops! Looks like the Popcorn Explorers couldn't find anything"
            paras={[
                "Possible reason: Comment id is incorrect.",
                "Please search the comment by its content in the explore page.",
                "You can also search the author of the comment by their username."
            ]}
            fullScreen
        />
    )

    // Now if comment contains NSFW and user is a guest or user does not allow NSFW.
    else if (comment.nsfw && (!user || user.filterContent)) return (
        <ContentFiltered />
    )

    else if (user) {
        await Promise.all([
            prefetchQuery({
                queryKey: getQueryKeys("like_cid", { cid }),
                queryFn: () => checkLikeOnComment(cid, user.user_id, jar),
                queryClient,
            }),
            prefetchQuery({
                queryKey: getQueryKeys("isContentSaved_type_id", { type: "comment", id: cid }),
                queryFn: () => checkIfItemSaved(cid, user.user_id, jar),
                queryClient,
            }),
            prefetchQuery({
                queryKey: getQueryKeys("ifReportExists_cnid_type", { type: "comment", cnid: cid }),
                queryFn: () => checkIfReportExists(cid, user.user_id, "comment", jar),
                queryClient,
            }),
        ]);
    }

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <CommentHeader uid={user?.user_id} id={cid} />
            {children}
        </HydrationBoundary>
    )
}

const CommentLayout = async ({ children, params }: PropsWithChildren<Params>) => {

    const cid = params.id.split('-')[0];

    if (cid && !isValidParloId(cid)) return (
        <NotFound
            title="Oops! Look's like you came across a wrong path."
            paras={["Incorrect comment id!", "Please search the comment by its content in the explore page."]}
            fullScreen
            redirectToExplore
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