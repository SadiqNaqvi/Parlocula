"use client";

import { SendIcon, XmarkIcon } from "@assets/Icons";
import BottomSheet, { BottomSheetRef } from "@components/BottomSheet";
import { Form, Input, ToggleButton } from "@components/form";
import GiphyComponent from "@components/GiphyComponent";
import { createCommentOnPost, updateComment } from "@lib/helpers/client";
import { addingItemsMutation, setDataMutation } from "@lib/mutation";
import { getQueryClient } from "@lib/queryClient";
import { checkEditedFields, getQueryKeys } from "@lib/utils";
import useGlobalState from "@store/globalStore";
import useCurrentUser from "@store/user";
import { useMutation } from "@tanstack/react-query";
import { FullComment, MessageReplyType } from "@type/internal";
import { CommentSchemaType, CommentSchemaUpdateType } from "@type/schemas";
import { useRef, useState } from "react";

type Props = {
    qkeys: (string | number)[]
    post_id: string,
    post_author: string,
} & ({
    editing?: false
    defaultValue?: undefined,
    cid?: string,
} | {
    editing: true,
    defaultValue: FullComment,
    cid: string,
});

type UpdateCommentMutationProp = {
    cid: string,
    uid: string,
    comment: CommentSchemaUpdateType
}

const CommentInput = ({ post_author, post_id, qkeys, editing, defaultValue, cid }: Props) => {

    const { meta, user } = useCurrentUser();
    const [gif, toggleGif] = useState(defaultValue?.attachment || "");
    const queryClient = getQueryClient();
    const [reply, setReply] = useGlobalState<MessageReplyType | undefined>(`reply:post:${post_id}`, undefined);
    const gifRef = useRef<BottomSheetRef>();

    const postCommentMutation = useMutation({
        mutationFn: ({ comment, user_id }: { comment: CommentSchemaType, user_id: string }) =>
            createCommentOnPost(comment, user_id),
        onMutate: ({ comment }) => addingItemsMutation(
            {
                ...comment, profile: user?.profile,
                createdAt: Date.now(),
                updatedAt: Date.now()
            },
            qkeys,
            queryClient,
        ),
        onError: (e, v, c) => {
            queryClient.setQueryData(qkeys, c?.previousState);
        }
    });

    const updateCommentMutation = useMutation({
        mutationFn: ({ cid, uid, comment }: UpdateCommentMutationProp) => updateComment(cid, uid, comment),
        onMutate: ({ cid, comment }) => setDataMutation(
            comment,
            getQueryKeys("comment_cid", { cid }),
            queryClient
        ),
        onError: (e, v, c) => setDataMutation(c?.previousState, getQueryKeys("comment_cid", { cid: v.cid }), queryClient),
    });

    if (!meta) return (
        <footer style={{ maxWidth: "100%" }} className="py-2 bg-primary fixed bottom-0 w-full">
            <div className="w-full max-w-screen-md mx-auto">
                <p className="text-center">You need to log-in to post a comment</p>
            </div>
        </footer>
    )

    const setGif = (data: any) => {
        toggleGif(data.images.fixed_height.webp);
        gifRef.current?.close();
    }

    const removeReply = () => setReply(undefined)

    const handleCommentEdit = (newData: any) => {
        if (!defaultValue || !editing || !cid) return;
        const updatedValues = checkEditedFields(defaultValue, newData);
        updateCommentMutation.mutate({
            cid,
            uid: meta.user_id,
            comment: updatedValues,
        });
    }

    const postComment = async (formData: any) => {

        const { content, nsfw, spoiler } = formData;
        if (content.length < 2 && !gif) return;

        if (editing) return handleCommentEdit(formData);

        const date = new Date();
        const comment = {
            post_author,
            post_id,
            content,
            upvote_count: 0,
            createdAt: date,
            updatedAt: date,
            attachment: gif,
            nsfw, spoiler,
            username: meta.username,
            ...(reply ?? {})
        };

        postCommentMutation.mutate({ comment, user_id: meta.user_id });

        removeReply();
    }

    return (
        <footer style={{ maxWidth: "100%" }} className="py-2 bg-primary fixed bottom-0 w-full">

            <div className="w-full max-w-screen-md mx-auto">
                {reply &&
                    <div className="flex gap-3 text-sm flex-cntr-between px-4 py-2 rounded-t-md border border-b-0 border-gray30">
                        <p className="line-clamp-1">
                            {reply.replied_content}
                        </p>
                        <button
                            onClick={removeReply}
                            className="smallBtn p-2 rounded-full bg-gray10"
                        >
                            <XmarkIcon className="size-2" />
                        </button>
                    </div>
                }

                <div className="border-t space-y-3 pt-2 border-gray30">

                    {gif && (
                        <div className="relative w-fit">
                            <button
                                onClick={() => toggleGif("")}
                                className="smallBtn size-6 flex flex-cntr-all border border-gray30 bg-primary rounded-full absolute top-0 right-0 mt-1 mr-1">
                                <XmarkIcon className="size-3" />
                            </button>
                            <img src={gif} alt="Chosen GIF" className="size-24 rounded-md border border-gray30" />
                        </div>
                    )}

                    <div>
                        <Form
                            submit={postComment}
                            defaultVals={defaultValue}
                            className={`flex w-full px-2 gap-2`}
                        >
                            <div className="flex-1">

                                <Input
                                    containerClasses="reset"
                                    autoFocus
                                    placeholder="Write you comment here..."
                                    className={`bg-transparent w-full py-3`}
                                    name="content"
                                />

                                <div className="flex gap-4 py-2 items-center">

                                    <BottomSheet ref={gifRef} button="GIF" className="text-sm py-1 px-2 rounded-md border border-gray40">
                                        <GiphyComponent callback={setGif} />
                                    </BottomSheet>

                                    <ToggleButton label="nsfw" className="uppercase text-sm inline-flex w-fit gap-3" />
                                    <ToggleButton label="spoiler" className="capitalize text-sm inline-flex w-fit gap-3" />
                                </div>

                            </div>
                            <button type="submit" className="pt-3">
                                <SendIcon className="size-4 color-secondary" />
                            </button>
                        </Form>
                    </div>
                </div>
            </div>

        </footer>
    )
}

export default CommentInput;