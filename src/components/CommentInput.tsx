"use client";

import { SendIcon, XmarkIcon } from "@assets/Icons";
import { createCommentOnPost } from "@lib/helpers/client";
import { addingItemsMutation } from "@lib/mutation";
import { getQueryClient } from "@lib/queryClient";
import useCurrentUser from "@store/user";
import { FullComment } from "@type/internal";
import { useState } from "react";
import { Form, Input, ToggleButton } from "./form";
import GiphyComponent from "./GiphyComponent";
import Modal, { closeFancyBox } from "./Modal";

type Props = {
    queryKeys: (string | number)[],
} & ({
    isEditing: false, defaultVals?: undefined
    post_id: string;
    post_author: string;
    reply: { replied_to: string, parent: string } | null,
    removeReply: () => void,
    placeholder?: string,
} | {
    isEditing: true, defaultVals: FullComment,
    post_id?: string;
    post_author?: string;
    reply?: { replied_to: string, parent: string } | null,
    removeReply?: () => void,
    placeholder?: string,
})

const mutationFn = async ({ comment, user_id }: { comment: any, user_id: string }) => {
    await createCommentOnPost(comment, user_id);
}

const CommentInput = ({ isEditing, queryKeys, defaultVals, placeholder, post_author, post_id, removeReply, reply }: Props) => {

    const { user, isHydrated } = useCurrentUser();
    const queryClient = getQueryClient();
    const [gif, toggleGif] = useState(defaultVals?.attachment ?? "");

    if (!isHydrated) return null;

    if (!user) return (
        <footer style={{ maxWidth: "100%" }} className="py-2 bg-primary absolute bottom-0 w-full">
            <div className="w-full max-w-screen-md mx-auto">
                <p className="text-center">You need to log-in to post a comment</p>
            </div>
        </footer>
    )

    const setGif = (data: any) => {
        closeFancyBox();
        toggleGif(data.images.fixed_height.webp);
    }

    const handleEditing = async (data: any) => {
        if (!isEditing) return;
        const comment: Record<string, any> = defaultVals;
        const update = Object.keys(comment).reduce((o, k) => {
            if (comment[k] === data[k]) return o;
            else return { ...o, [k]: data[k] }
        }, {});
        console.log(update);
        // updateComment
    }

    const postComment = async (data: any) => {

        if (isEditing) await handleEditing(data);

        else {
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

            // Perform optimistic updation
            await addingItemsMutation({ ...comment, profile: user.profile }, queryKeys, queryClient);
            mutationFn({ comment, user_id: user._id });

            reply && removeReply();
        }
    }

    return (
        <footer style={{ maxWidth: "100%" }} className="py-2 bg-primary absolute bottom-0 w-full">

            <div className="w-full max-w-screen-md mx-auto">
                {reply &&
                    <div className="flex gap-3 text-sm flex-cntr-between px-4 py-2 rounded-t-md border border-b-0 border-gray30">
                        <p className="line-clamp-1">
                            {reply.parent}
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
                            defaultVals={defaultVals}
                            submit={postComment}
                            className={`flex w-full px-2 gap-2`}
                        >
                            <div className="flex-1">

                                <Input
                                    containerClasses="reset"
                                    autoFocus
                                    placeholder={placeholder ?? "Write you comment here..."}
                                    className={`bg-transparent w-full py-3`}
                                    name="content"
                                />

                                <div className="flex gap-4 py-2 items-center">

                                    <Modal buttonChildren={"GIF"} id="gif-picker" type="button" className="text-sm py-1 px-2 rounded-md border border-gray40">
                                        <GiphyComponent callback={setGif} />
                                    </Modal>

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