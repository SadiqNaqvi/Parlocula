"use client";

import CommentInput from "@components/CommentInput";
import InfiniteScroller from "@components/InfiniteScroller";
import RouterDropdown from "@components/RouterDropdown";
import { CommentTile, LoadingCommentTile, NotFound } from "@components/ui";
import { getCommentsOnPost } from "@lib/helpers/common";
import { queryFilters } from "@lib/constants";
import { convertCodeIntoError, infiniteScrollerResponse } from "@lib/utils";
import useCurrentUser from "@store/user";
import { MereComment } from "@type/internal";
import { useState } from "react";

const fetchData = async (id: string, page: number, filter: string = "popular") => {
    const { errCode, result, success } = await getCommentsOnPost({ id, page, filter })
    if (!success) throw new Error(convertCodeIntoError(errCode) as string)
    return infiniteScrollerResponse(result, page);
}

type Props = {
    id: string,
    page: number,
    filter: string,
    initialData: any,
    comment_count: number,
    post_author: string,
}

const notFoundMessage = {
    title: "No comments yet",
    paras: ["Be the first to comment on this post"]
}

const CommentSection = ({ id, page, filter, initialData, comment_count, post_author }: Props) => {

    if (comment_count || (initialData && !initialData.total))
        return (
            <section>
                <div className="py-3 border-b border-gray-500">
                    <h2 className="font-semibold text-lg">Comments</h2>
                </div>
                <NotFound {...notFoundMessage} />
            </section>
        )

    const { user } = useCurrentUser();
    const [reply, setReply] = useState<{ parent: string, replied_to: string } | null>(null);
    const [comments, setComments] = useState<MereComment[]>([]);

    const addReply = (replyToAdd: { parent: string, replied_to: string }) => {
        setReply(replyToAdd);
    }

    const removeReply = () => {
        setReply(null);
    }

    const postComment = (comment: MereComment) => {
        setComments([comment, ...comments]);
        setReply(null);
    }

    return (
        <>
            <section>
                <div className="py-3 border-b border-gray20 flex flex-cntr-between">
                    <h2 className="font-semibold text-lg">Comments</h2>
                    <RouterDropdown tabs={queryFilters.comments} />
                </div>
                {!!comments.length &&
                    <ul className="my-3 space-y-3">
                        {comments.map(comment => (
                            <li key={`${comment.createdAt}`}>
                                <CommentTile {...comment} />
                            </li>
                        ))}
                    </ul>
                }
                <InfiniteScroller
                    Component={CommentTile}
                    Loading={LoadingCommentTile}
                    fetchData={(p) => fetchData(id, p, filter)}
                    notFoundMessage={notFoundMessage}
                    queryKeys={[`${filter}-comments-post-${id}`, `${page}`]}
                    initialData={initialData}
                    initialPage={page}
                    paginate={true}
                    callback={addReply}
                />
            </section>
            <CommentInput post_id={id} user={true} post_author={post_author} callback={postComment} removeReply={removeReply} reply={reply} />
        </>
    )
}

export default CommentSection;