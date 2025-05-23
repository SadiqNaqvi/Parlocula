"use client";

import { SendIcon, XmarkIcon } from "@assets/Icons";
import { Fancybox } from "@fancyapps/ui";
import { useState } from "react";
import { Form, Input, ToggleButton } from "./form";
import GiphyComponent from "./GiphyComponent";
import Modal from "./Modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCommentOnPost } from "@lib/helpers/client";
import useCurrentUser from "@store/user";
import { addingItemsMutation, mutationWrapper } from "@lib/mutation";

type Props = {
    post_id: string;
    post_author: string;
    reply: { replied_to: string, parent: string } | null,
    removeReply: () => void,
    queryKeys: (string | number)[],
    isEditing: boolean,
}

const mutationFn = async ({ comment, user_id }: { comment: any, user_id: string }) => {
    await createCommentOnPost(comment, user_id);
}

const CommentInput = ({ reply, removeReply, queryKeys, post_id, post_author }: Props) => {

    const { user, isHydrated } = useCurrentUser();

    const queryClient = useQueryClient();

    const mutation = useMutation(mutationWrapper({
        mutationFn,
        queryKeys,
        queryClient,
        optimisticWork: addingItemsMutation,
    }));

    const [gif, toggleGif] = useState("");

    if (!isHydrated) return null;

    if (!user) return (
        <footer className="py-4 bg-primary fixed bottom-0 max-w-screen-md w-full">
            <p className="text-center">You need to log-in to post a comment</p>
        </footer>
    )

    const setGif = (data: any) => {
        setTimeout(() => Fancybox.close(true), 100)
        toggleGif(data.images.fixed_height.webp);
    }

    const postComment = async (data: any) => {
        const { content, nsfw, spoiler } = data;
        if (content.length < 2 && !gif) return;
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
            username: user.username,
            ...reply
        };

        mutation.mutate({ comment, user_id: user._id });
        reply && removeReply();
    }

    return (
        <footer className="mt-4 py-2 bg-primary sticky -mb-20 bottom-0 max-w-screen-md w-full">

            {reply &&
                <div className="flex gap-3 text-sm flex-cntr-between px-4 py-2 rounded-t-md border border-b-0 border-gray30">
                    <p className="line-clamp-1">
                        {reply.parent}
                    </p>
                    <button
                        onClick={removeReply}
                        className="smallBtn px-2 py-1 rounded-full bg-gray10"
                    >
                        <XmarkIcon className="size-3" />
                    </button>
                </div>
            }

            <div className="border-t space-y-3 pt-2 border-gray30">

                {gif && (
                    <section>
                        <div className="relative w-fit">
                            <button
                                onClick={() => toggleGif("")}
                                className="smallBtn size-6 flex flex-cntr-all border border-gray30 bg-primary rounded-full absolute top-0 right-0 mt-1 mr-1">
                                <XmarkIcon className="size-3" />
                            </button>
                            <img src={gif} alt="Chosen GIF" className="size-24 rounded-md border border-gray30" />
                        </div>
                    </section>
                )}

                <div className="flex items-center gap-2">
                    <Form
                        submit={postComment}
                        className={`flex w-full items-center px-2 gap-2`}
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

                                <Modal buttonChildren={"GIF"} id="gid-picker" type="button" className="text-sm py-1 px-2 rounded-md border border-gray40">
                                    <GiphyComponent callback={setGif} />
                                </Modal>

                                <ToggleButton label="nsfw" className="uppercase text-sm inline-flex w-fit gap-3" />
                                <ToggleButton label="spoiler" className="capitalize text-sm inline-flex w-fit gap-3" />
                            </div>
                        </div>
                        <button type="submit">
                            <SendIcon className="size-4 color-secondary" />
                        </button>
                    </Form>
                </div>
            </div>

        </footer>
    )
}

export default CommentInput;