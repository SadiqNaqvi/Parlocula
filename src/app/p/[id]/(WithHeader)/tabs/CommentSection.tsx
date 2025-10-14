"use client";

import CommentInput from "@components/CommentInput";
import InfiniteScroller from "@components/InfiniteScroller";
import { CommentTile, LoadingCommentTile, LoadingSpinner } from "@components/ui";
import { getCommentsOnPost, getPostById } from "@lib/helpers/common";
import { useQueryHook } from "@lib/hooks";
import { getQueryKeys } from "@lib/utils";
import { FullPost } from "@type/internal";

type Props = {
    id: string,
    page: number,
    filter: string,
}

const notFoundMessage = {
    title: "No comments yet",
    paras: ["Be the first to comment on this post"]
}

const CommentSection = ({ id, page, filter }: Props) => {

    const { data, isFetching } = useQueryHook<FullPost>({
        queryFn: () => getPostById(id),
        queryKeys: getQueryKeys("post_id", { id }),
    });

    if (isFetching) return <LoadingSpinner />
    else if (!data) return null;

    const { user_id } = data;

    return (
        <>
            <section className="min-h-[80dvh]">

                <InfiniteScroller
                    Component={CommentTile}
                    Loading={LoadingCommentTile}
                    fetchData={(p) => getCommentsOnPost({ id, page: p, filter })}
                    notFoundMessage={notFoundMessage}
                    queryKeys={getQueryKeys('commentsOfPost_pid_filter_page', { pid: id, page: String(page), filter })}
                    initialPage={page}
                    paginate={true}
                />
            </section>

            <CommentInput
                post_id={id}
                post_author={user_id}
                qkeys={getQueryKeys('commentsOfPost_pid_filter_page', { pid: id, page: String(page), filter })}
            />
        </>
    )
}

export default CommentSection;