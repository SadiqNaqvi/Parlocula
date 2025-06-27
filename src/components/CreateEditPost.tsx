"use client";

import { AddIcon, AlertIcon, LeftChevron, XmarkIcon } from "@assets/Icons";
import { LinkInputManager, Modal, Navbar, Navigate, OptionMenu } from "@components";
import { Form, MediaInputPrompt, PostTagList, Textarea, ToggleButton } from "@components/form";
import { numberOfFrames, postLinksLength, postTags } from "@lib/constants";
import { getPoster } from "@lib/utils";
import { InputManagerType } from "@type/other";
import { InputFrame, LinkSchema } from "@type/schemas";
import { useRef, useState } from "react";
import { Popover, Triggerer } from "./Modal";
import MediaInputManager from "./form/MediaInputCont";
import ChooseThreadButton from "@app/new/threadChoice";

type PostClientCommon = {
    title: string,
    body: string,
    nsfw: boolean,
    spoiler: boolean,
};

type CallbackVal = PostClientCommon & {
    tag: string,
    frames: InputFrame[],
    links: LinkSchema[]
}

type Props = {
    defaultVals?: CallbackVal,
    callback: (arg: CallbackVal) => void,
    isEditing: boolean,
    defaultThread?: string,
}

const CreateEditPost = ({ defaultVals, callback, isEditing, defaultThread }: Props) => {

    const formRef = useRef<HTMLFormElement | null>(null);
    const linksRef = useRef<InputManagerType>(null);
    const framesRef = useRef<InputManagerType>(null);
    const threadRef = useRef<InputManagerType>(null);

    const [tag, setTag] = useState(defaultVals?.tag ?? "");

    const addTag = (tag: string) => {
        setTag(tag);
    }

    const validateExtraFields = (links: any[]) => {
        if (!postTags.includes(tag)) return "Invalid Tag! Please choose a valid tag."

        if (tag === "frames" && !(frames.length >= 1 && frames.length <= numberOfFrames.total))
            return `Frames based post must have at least 1 frame and upto ${numberOfFrames.total} frames are allowed`
        else if (tag === "links" && !(links.length >= 1 && links.length <= postLinksLength))
            return `Links based post must have at least 1 link and upto ${postLinksLength} links are allowed`
        else if (tag !== "frames" && frames.length > 1) return "Only one frame is allowed in non-frame post"
    }

    const submitForm = async (data: PostClientCommon) => {
        const links = linksRef.current?.getData();
        const frames = framesRef.current?.getData();

        const error = validateExtraFields(links);
        if (error) return error;
        return await callback({ ...data, frames, tag, links });
    }

    const requestSubmit = () => {
        if (formRef.current) formRef.current.requestSubmit();
    }

    return (
        <>
            <Navbar
                navTitle={isEditing ? "Edit Post" : "Create Post"}
                OptionButton={<button className="primary" onClick={requestSubmit}>Post</button>}
            />

            <section className="flex mb-4 gap-2 overflow-x-auto">
                {!isEditing && !defaultThread && (<ChooseThreadButton ref={threadRef} />)}
                <Modal
                    className="gap-3 py-2 px-3 rounded-full bg-gray10"
                    id="tag-popover"
                    buttonChildren={tag ?
                        <>
                            <AlertIcon className="h-4" />
                            <span className="text-sm">{tag}</span>
                        </>
                        :
                        "Choose Tag"
                    }>
                    <PostTagList defaultTag={tag} func={addTag} />
                </Modal>
            </section>

            <Form defaultVals={defaultVals} className="space-y-4" ref={formRef} submit={submitForm}>
                <Textarea
                    required
                    autoFocus
                    minLength={15}
                    maxLength={500}
                    name="title"
                    className="text-xl leading-snug font-semibold w-full"
                    placeholder="Title of the Post"
                    autoCapitalize="on"
                >
                </Textarea>
                <Textarea
                    name="body"
                    maxLength={5000}
                    placeholder="Body of the post (optional)"
                    className="w-full mt-2"
                >
                </Textarea>
                <ToggleButton label="nsfw" className="mt-3 uppercase w-full" />
                <ToggleButton label="spoiler" className="mt-3 capitalize w-full" />
            </Form>
            <section className="mt-4 space-y-3">
                <MediaInputManager allowBoth defaultFrames={defaultVals?.frames} limit={tag === "frames" ? 5 : undefined} ref={framesRef} />

                <LinkInputManager ref={linksRef} />
            </section>

        </>
    )
}

export default CreateEditPost;