"use client";

import { InfiniteScroller } from "@components";
import CommentInput from "@components/CommentInput";
import { CommentTile } from "@components/ui";
import { getRepliesOnComment } from "@lib/helpers/common";
import { useCustomReducer } from "@lib/hooks";
import { getQueryKeys, queryFunction } from "@lib/utils";

type Props = {
    id: string,
    post_id: string,
    post_author: string,
    filter: string,
    page: number,
}

const RepliesSection = ({ id, post_id, post_author, filter, page }: Props) => {

    const { reply, setter, isEditing } = useCustomReducer({
        isEditing: false,
        reply: null as { parent: string, replied_to: string } | null,
    });

    const addReply = (replyToAdd: { parent: string, replied_to: string }) => {
        setter({ reply: replyToAdd });
    }

    const removeReply = () => {
        setter({ reply: null });
    }

    return (
        <>
            <section className="stretch-container">

                <InfiniteScroller
                    Component={CommentTile}
                    callback={addReply}
                    fetchData={(p) => queryFunction(getRepliesOnComment, [id, p, filter])}
                    queryKeys={getQueryKeys("replies_cid_filter_page", { cid: id, page, filter })}
                />

            </section>
            <CommentInput
                post_author={post_author}
                post_id={post_id}
                isEditing={false}
                queryKeys={getQueryKeys("replies_cid_filter_page", { cid: id, page, filter })}
                removeReply={removeReply}
                reply={reply}
                placeholder={reply ? undefined : "Reply to this comment"}
            />
        </>
    )
}

export default RepliesSection;