import { getCommentById } from "@lib/helpers/common";
import { getQueryClient } from "@lib/queryClient";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import EditComment from "./Component";

const CommentEditPage = async ({ params }: { params: { id: string } }) => {

    const cid = params.id;
    const queryClient = getQueryClient();

    await queryClient.prefetchQuery({
        queryKey: getQueryKeys("comment_cid", { cid }),
        queryFn: () => queryFunction(getCommentById, [cid]),
        staleTime: 60 * 60 * 1000,
        gcTime: 60 * 60 * 1000
    });

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <EditComment id={cid} />
        </HydrationBoundary>
    )
}

export default CommentEditPage;