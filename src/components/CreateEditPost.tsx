"use client";

import { AddIcon, AlertIcon, LeftChevron, LinkIcon, XmarkIcon } from "@assets/Icons";
import placeholder from "@assets/placeholder.png";
import { LinkInputCont, MediaInputCont, Modal, Navigate, OptionMenu, ThreadTagList } from "@components";
import { Form, Textarea, ToggleButton } from "@components/form";
import { useCustomReducer } from "@lib/hooks";
import { InputFrame, LinkSchema } from "@type/schemas";
import Image from "next/image";
import { useRef } from "react";
import { Popover, Triggerer } from "./Modal";

type ReducerProps = {
    frames: InputFrame[],
    links: LinkSchema[]
    tag: string,
}

type PostClientCommon = { title: string, body: string, nsfw: boolean, spoiler: boolean };

type CallbackVal = PostClientCommon & ReducerProps

type Props = {
    defaultVals?: CallbackVal,
    callback: (arg: CallbackVal) => void
} & (| { isEditing: false, goBack: () => void } | { isEditing: true, goBack: undefined })

const CreateEditPost = ({ defaultVals, callback, isEditing, goBack }: Props) => {

    const formRef = useRef<HTMLFormElement | null>(null);

    const {
        frames,
        links,
        tag,
        setter
    } = useCustomReducer<ReducerProps>({
        links: defaultVals?.links ?? [],
        frames: defaultVals?.frames ?? [],
        tag: defaultVals?.tag ?? "",
    });

    const addTag = (tag: string) => {
        setter({ tag });
    }

    const addLink = (data: LinkSchema) => {
        if (links.find(el => el.path === data.path)) return;
        setter({ links: [...links, data] });
    }

    const removeLink = (obj: LinkSchema) => {
        setter({ links: links.filter(el => el.path != obj.path) });
    }

    const getFrames = (frames: InputFrame[]) => {
        setter({ frames });
    }

    const removeFrame = (ind: number) => {
        setter({ frames: frames.filter((_, i) => i !== ind) });
    }

    const submitForm = async (data: PostClientCommon) => {
        const formDataObj = { ...data, tag, links, frames };
        return await callback(formDataObj);
    }

    const requestSubmit = () => {
        if (formRef.current) formRef.current.requestSubmit();
    }

    const options: any[] = [
        links.length < 5 && { label: "Link", src: "link-popover" },
        tag === "frames" && { label: "frames", src: "frames-popover" },
        (!frames.length && tag !== "frames") && { label: "Video", src: "video-popover" },
        (!frames.length && tag !== "frames") && { label: "Image", src: "image-popover" },
    ].filter(Boolean);

    return (
        <>
            <header className="h-16 mb-4 flex items-center gap-4">
                {isEditing ?
                    <Navigate comp="button" goto="back">
                        <LeftChevron />
                    </Navigate>
                    :
                    <button className="iconBtn" onClick={goBack}>
                        <LeftChevron />
                    </button>
                }
                <h1 className="inline text-2xl">New Post</h1>
                <OptionMenu id="post-modal" ButtonElement={<AddIcon />} className="ml-auto iconBtn" controls="manual" heading="Add">
                    <ul>
                        {options.map(el => (
                            <li key={el.label} className="w-full md:hover:bg-gray-500 md:hover:bg-opacity-30 transition-colors border-b border-gray30 ">
                                <Triggerer
                                    id={el.src}
                                    className="smallBtn w-full text-left capitalize py-3 px-4"
                                >
                                    {el.label}
                                </Triggerer>
                            </li>
                        ))}
                    </ul>
                </OptionMenu>
                <button className="primary" onClick={requestSubmit}>Post</button>
            </header>

            <section className="flex mb-4 gap-2 overflow-x-auto">
                <Modal
                    className="gap-3 py-2 px-3 rounded-full bg-gray10"
                    id="tag-popover"
                    buttonChildren={tag ?
                        <>
                            <AlertIcon classnames="h-4" />
                            <span className="text-sm">{tag}</span>
                        </>
                        :
                        "Choose Tag"
                    }>
                    <ThreadTagList defaultTag={tag} func={addTag} />
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
                <ToggleButton label="nsfw" className="py-3 uppercase" />
                <ToggleButton label="spoiler" className="py-3 capitalize" />
            </Form>

            <Popover id="image-popover"><MediaInputCont defaultFrames={frames} type="image" callback={getFrames} /></Popover>
            <Popover id="video-popover"><MediaInputCont defaultFrames={frames} type="video" callback={getFrames} /></Popover>
            <Popover id="frames-popover"><MediaInputCont defaultFrames={frames} type="image" multiple={5} callback={getFrames} /></Popover>
            <Popover id="link-popover"><LinkInputCont func={addLink} /></Popover>

            {
                !!links.length &&
                <section className="my-4 overflow-x-auto flex gap-4 noScroll">
                    {links.map(el => (
                        <div key={el.path} className="px-2 py-3 flex gap-2 bg-gray10 rounded-md">
                            <LinkIcon classnames="h-4 text-zinc-500" />
                            <span className="text-sky-500 text-nowrap">
                                {el.path}
                            </span>
                            <button className="smallBtn" onClick={() => removeLink(el)}>
                                <XmarkIcon classnames="h-4" />
                            </button>
                        </div>
                    ))}
                </section>
            }
            <section className="my-4 flex gap-4 overflow-x-auto">
                {frames.map((frame, ind) => (
                    <div className="relative bg-gray30 border border-gray40">
                        <button className="absolute z-[1] p-2 rounded-md bg-gray30 border border-gray40 iconBtn mt-1 mr-1 right-0 top-0" onClick={() => removeFrame(ind)}>
                            <XmarkIcon classnames="h-4" />
                        </button>
                        {frame.type === "image" ?
                            <Image className="size-64 object-contain" style={{ backgroundImage: `url(${placeholder})` }} src={frame.path} alt="" width={500} height={500} />
                            :
                            <video controls className="size-64 object-contain" src={frame.path} />
                        }
                    </div>
                ))}
            </section>

            <p className="text-zinc-500 text-center mt-4">If any content (title, body, links, image or video) in this post contains Spoilers or NSFW content, please use the relevent tags or your post will be flagged as inappropriate.</p>
            <p className="text-zinc-500 text-center mt-3">If your post is media/links based, please choose specific tag.</p>
            <p className="mt-2 text-sm text-zinc-500">Media based post requires atleast 1 media. Same goes for links based post.</p>

        </>
    )
}

export default CreateEditPost;