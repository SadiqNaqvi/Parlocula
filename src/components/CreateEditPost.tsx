"use client";

import ChooseThreadButton from "@app/post/new/threadChoice";
import { LinkInputManager, Navbar } from "@components";
import { Form, Textarea, ToggleButton } from "@components/form";
import { MereThread } from "@type/internal";
import { InputManagerType } from "@type/other";
import { InputFrame, LinkSchema } from "@type/schemas";
import { useRef, useState } from "react";
import MediaInputManager from "./form/MediaPicker";
import PostCategoryPicker from "./form/PostCategoryPicker";
import DescriptiveSheet from "./sheets/DescriptiveSheet";

type PostClientCommon = {
    title: string,
    body: string,
    nsfw: boolean,
    spoiler: boolean,
};

export type CreateEditPostReturn = PostClientCommon & {
    category: string,
    frames: InputFrame[],
    links: LinkSchema[],
    thread_id?: string,
}

type Props = {
    defaultVal: CreateEditPostReturn | undefined,
    callback: (arg: CreateEditPostReturn) => Promise<any>,
    isEditing: boolean,
    defaultThread: MereThread | undefined,
    titleOfQuotedPost: string | undefined,
}

const CreateEditPost = ({ defaultVal, callback, isEditing, defaultThread, titleOfQuotedPost }: Props) => {

    const formRef = useRef<HTMLFormElement | null>(null);
    const linksRef = useRef<InputManagerType>(null);
    const framesRef = useRef<InputManagerType>(null);
    const threadRef = useRef<InputManagerType>(null);

    const [category, setCategory] = useState(defaultVal?.category ?? "");

    const addCategory = (category: string) => {
        setCategory(category);
    }

    const submitForm = async (data: PostClientCommon) => {
        const thread_id = defaultThread?._id ?? threadRef.current?.getData();
        console.log(thread_id)
        if (!(isEditing || thread_id)) return "Choose a thread to post."

        const links = linksRef.current?.getData();
        const frames = framesRef.current?.getData();

        const callbackData = Object({
            ...data, frames, category, links,
            ...(!isEditing && { thread_id })
        })

        return await callback(callbackData);
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

            {!isEditing && titleOfQuotedPost && (
                <section className="my-2 w-full border border-gray50 p-2">
                    <p className="font-semibold line-clamp-2">{titleOfQuotedPost}</p>
                </section>
            )}

            <section className="flex flex-cntr-between my-4 overflow-x-auto px-2 sm:px-4">
                <div className="flex gap-2">
                    {!isEditing && (
                        <ChooseThreadButton defaultVal={defaultThread} ref={threadRef} />
                    )}

                    <PostCategoryPicker defaultCategory={category} func={addCategory} />
                </div>
                <div>
                    <DescriptiveSheet
                        title="rules"
                        descriptions={[
                            "If any of the content in this post, either title, body, frames or links contain NSFW or Spoiler, please mark them accordingly.",
                            "Wrong flags may lead to temporary or in some cases, permanent ban."
                        ]}
                    >
                        Rules
                    </DescriptiveSheet>
                </div>
            </section>

            <Form defaultVals={defaultVal} className="space-y-4 px-2 sm:px-4" ref={formRef} submit={submitForm}>
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

            <section className="mt-4 space-y-3 px-2 sm:px-4">
                <MediaInputManager allowBoth defaultFrames={defaultVal?.frames} limit={category === "frames" ? 5 : undefined} ref={framesRef} />

                <LinkInputManager ref={linksRef} />
            </section>

        </>
    )
}

export default CreateEditPost;