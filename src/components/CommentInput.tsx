"use client";

import { SendIcon, XmarkIcon } from "@assets/Icons";
import BottomSheet, { BottomSheetRef } from "@components/BottomSheet";
import { Form, Input, ToggleButton } from "@components/form";
import GiphyComponent from "@components/GiphyComponent";
import { GifResult } from "@giphy/js-fetch-api";
import { parloculaAppURL } from "@lib/constants";
import { createCommentMutation, updateCommentMutation } from "@lib/helpers/mutations";
import { checkEditedFields, parloId } from "@lib/utils";
import useGlobalStore from "@store/globalStore";
import { useNavigation } from "@store/historystack";
import useCurrentUser from "@store/user";
import { CommentReplyType, FullComment } from "@type/internal";
import Image from "next/image";
import { useRef, useState } from "react";
import { OptionalChildren } from "./ui";

type Props = {
    section: "replies" | "comments",
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

type CommentFormData = {
    content: string,
    nsfw: boolean,
    spoiler: boolean
}

type ParentCommentType = (CommentReplyType & { replied_to: string });

const ReplyBar = ({ reply }: { reply: ParentCommentType | undefined }) => {

    if (!reply || !reply.replied_to || !(reply.attachment || reply.content)) return null;

    const { attachment, content } = reply;

    if (!content && attachment) return (
        <div className="space-y-3 p-2 border border-gray20 rounded-md w-full">
            <Image
                height={48}
                width={48}
                alt="GIF attached with the comment"
                src={attachment}
                className="object-contain size-12 rounded-md"
            />
        </div>
    )

    else if (content) return (
        <div className="space-y-3 p-2 border border-gray20 rounded-md w-full">
            <p className="text-sm line-clamp-2">{content}</p>
        </div>
    )

}

const CommentInput = ({ post_author, post_id, section, editing, defaultValue, cid }: Props) => {

    const { meta } = useCurrentUser();
    const [gif, setGif] = useState(defaultValue?.attachment || "");
    const [reply, setReply] = useGlobalStore<ParentCommentType | undefined>(`reply:post:${post_id}`, undefined);
    const gifSheetRef = useRef<BottomSheetRef>();
    const navigation = useNavigation();

    if (!meta) return (
        <footer style={{ maxWidth: "100%" }} className="py-2 bg-primary fixed bottom-0 w-full">
            <div className="w-full max-w-screen-md mx-auto">
                <p className="text-center">You need to log-in to post a comment</p>
            </div>
        </footer>
    )

    const handleGif = (data: GifResult["data"]) => {
        setGif(data.images.fixed_height.webp);
        gifSheetRef.current?.close();
    }

    const removeReply = () => setReply(undefined)

    const handleCommentEdit = (newData: Partial<CommentFormData>) => {
        if (!defaultValue || !editing || !cid) return;

        const updatedValues = checkEditedFields(defaultValue, newData);

        updateCommentMutation(cid, meta.user_id, updatedValues, post_id);
    }

    const postComment = async (formData: CommentFormData) => {

        const { content, nsfw, spoiler } = formData;
        if (content.length < 2 && !gif) return;

        if (editing) return handleCommentEdit(formData);

        const parent = reply ? { content: reply.content, attachment: reply.attachment } : undefined;
        const date = new Date();
        const comment = {
            _id: parloId(),
            post_author,
            post_id,
            content,
            likes_count: 0,
            createdAt: date,
            updatedAt: date,
            attachment: gif,
            nsfw, spoiler,
            username: meta.username,
            replied_to: reply?.replied_to,
            parent,
        };

        createCommentMutation(comment, section);
        const path = new URL(parloculaAppURL, navigation.pathname);
        path.searchParams.append("f", "latest");
        navigation.replace(path.pathname);
        setGif("");
        removeReply();
    }

    return (
        <footer style={{ maxWidth: "100%" }} className="py-2 bg-primary fixed bottom-0 w-full fullScreen">

            <div className="w-full max-w-screen-md mx-auto px-2">

                <ReplyBar reply={reply} />

                <div className="border-t space-y-3 pt-2 border-gray30">

                    <OptionalChildren condition={gif}>
                        <div className="relative w-fit">
                            <button
                                onClick={() => setGif('')}
                                className="smallBtn size-6 flex flex-cntr-all border border-gray30 bg-primary rounded-full absolute top-0 right-0 mt-1 mr-1">
                                <XmarkIcon className="size-3" />
                            </button>
                            <Image
                                src={gif}
                                alt="Chosen GIF"
                                className="size-24 rounded-md border border-gray30"
                                height={96}
                                width={96}
                            />
                        </div>
                    </OptionalChildren>

                    <div>
                        <Form
                            submit={postComment}
                            defaultVals={defaultValue}
                            className={`flex w-full px-2 gap-2`}
                        >
                            <div className="flex-1">

                                <Input
                                    containerClasses="reset"
                                    placeholder="Write you comment here..."
                                    className={`bg-transparent border-0 w-full py-3`}
                                    name="content"
                                />

                                <div className="flex gap-2 py-2 items-center">

                                    <BottomSheet ref={gifSheetRef} button="GIF" className="text-sm py-1 px-2 rounded-md border border-gray40">
                                        <GiphyComponent callback={handleGif} />
                                    </BottomSheet>

                                    <ToggleButton label="nsfw" className="uppercase text-sm bg-transparent" />
                                    <ToggleButton label="spoiler" className="capitalize text-sm bg-transparent has-[:checked]:bg-orange-500/20 has-[:checked]:border-orange-500" />
                                </div>

                            </div>
                            <button type="submit" className="mt-3 p-2 h-fit border border-gray10 rounded-full bg-gray10">
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