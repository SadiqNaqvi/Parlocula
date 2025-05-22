"use client";

import CommentInput from "@components/CommentInput";
import InfiniteScroller from "@components/InfiniteScroller";
import RouterDropdown from "@components/FiltersDropdown";
import { CommentTile, LoadingCommentTile, LoadingSpinner } from "@components/ui";
import { queryFilters } from "@lib/constants";
import { getCommentsOnPost, getPostById } from "@lib/helpers/common";
import { useQueryHook } from "@lib/hooks";
import { getQueryKeys, queryFunction } from "@lib/utils";
import { useState } from "react";

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

    const { data, isFetching, isError } = useQueryHook({
        queryFn: () => queryFunction(getPostById, [id]),
        queryKeys: getQueryKeys("post_id", { id }),
    });

    const [reply, setReply] = useState<{ parent: string, replied_to: string } | null>(null);

    if (isFetching) return <LoadingSpinner />
    else if (isError || !data) return null;

    const { user_id } = data;

    const addReply = (replyToAdd: { parent: string, replied_to: string }) => {
        setReply(replyToAdd);
    }

    const removeReply = () => {
        setReply(null);
    }

    return (
        <>
            <section className="min-h-[80dvh]">

                <div className="py-3 border-b border-gray20 flex flex-cntr-between">
                    <h2 className="font-semibold text-lg">Comments</h2>
                    <RouterDropdown tabs={queryFilters.comments} />
                </div>

                <InfiniteScroller
                    Component={CommentTile}
                    Loading={LoadingCommentTile}
                    fetchData={(p) => queryFunction(getCommentsOnPost, [{ id, p, filter }])}
                    notFoundMessage={notFoundMessage}
                    queryKeys={['comments-of-post', id, page, filter]}
                    initialPage={page}
                    paginate={true}
                    callback={addReply}
                />
            </section>

            <CommentInput
                post_id={id}
                post_author={user_id}
                isEditing={false}
                queryKeys={['comments-of-post', id, page, filter]}
                removeReply={removeReply}
                reply={reply} />
        </>
    )
}

export default CommentSection;