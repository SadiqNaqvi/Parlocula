"use client";

import CommentInput from "@components/CommentInput";
import { CommentTile, LoadingSpinner, NotFound, ShowError } from "@components/ui";
import { getRepliesOnComment } from "@lib/helpers/common";
import { useCustomReducer, useQueryHook } from "@lib/hooks";
import useCurrentUser from "@store/user";
import { MereComment } from "@type/internal";
import { useEffect, useOptimistic } from "react";

const queryFn = async (id: string) => {
    const { errCode, result, success } = await getRepliesOnComment(id);
    if (!success) throw new Error(errCode);
    return result;
}

const RepliesSection = ({ id, post_id, post_author }: { id: string, post_id: string, post_author: string }) => {
    const { reply, setter, state } = useCustomReducer<{
        state: boolean,
        reply: { parent: string, replied_to: string } | null
    }>({
        state: false,
        reply: null,
    });
    const { data, error, isFetching, refetch } = useQueryHook({
        queryFn: () => queryFn(id),
        queryKeys: [`replies`, `comment-${id}`],
        enabled: state,
    });
    const { user } = useCurrentUser();
    const [replies, setReplies] = useOptimistic(
        data ?? [],
        (replies, reply) => [reply, ...replies]
    );

    const postComment = (comment: MereComment) => {
        setReplies(comment);
        setter({ reply: null })
    }

    const addReply = (replyToAdd: { parent: string, replied_to: string }) => {
        setter({ reply: replyToAdd });
    }

    const removeReply = () => {
        setter({ reply: null });
    }

    const ComponentToShow = () => {
        if (!state) return (
            <div className="size-full flex flex-cntr-all">
                <div className="text-center">
                    <h3 className="text-lg">Fetch Replies</h3>
                    <button
                        className="mx-auto primary"
                        onClick={() => setter({ state: true })}>
                        Fetch
                    </button>
                </div>
            </div>
        )

        else if (isFetching) return <LoadingSpinner />

        else if (error) return (
            <ShowError
                heading="Error occured while fetching replies"
                errCode={error.message}
                retry={refetch}
            />
        )

        else if (!replies || !replies.length) return (
            <NotFound
                title="No replies yet!"
                paras={["Be the first to reply on this comment."]}
            />
        )

        else return (
            <ul className="space-y-4">
                {replies.map((reply: any) => (
                    <CommentTile key={reply._id} {...reply} callback={addReply} />
                ))}
            </ul>
        )
    }
    return (
        <>
            <ComponentToShow />
            <CommentInput
                post_author={post_author}
                post_id={post_id}
                user={user}
                callback={postComment}
                removeReply={removeReply}
                reply={reply}
            />
        </>
    )
}

export default RepliesSection;