"use client";

import { AddIcon, AlertIcon, LinkIcon, XmarkIcon } from "@assets/Icons";
import { OptionMenu, ThreadTagList, LinkInputCont, MediaInputCont } from "@components";
import { Form, Textarea, ToggleButton } from "@components/form";
import placeholder from "@assets/placeholder.png"
import Image from "next/image";
import { useForm, FormProvider } from "react-hook-form";
import { useCustomReducer } from "@lib/hooks";
import VideoPlayer from "@components/VideoPlayer";
import { zodResolver } from "@hookform/resolvers/zod";
import { LinkSchema, postSchemaClient, PostSchemaClientType, PostSchemaServerType } from "@lib/schemas";
import { useRef } from "react";
import { createPost } from "@lib/postActions";
import { objectToFormData } from "@lib/utils";

type MediaLinksTags = {
    image: string,
    video: string,
    links: LinkSchema[]
    tag: string,
    blob: Blob | null,
}

export default function Page({ params }: { params: { id: string } }) {
    const thread_id = params.id.split('-')[0];

    const formMethods = useForm<PostSchemaClientType>({
        resolver: zodResolver(postSchemaClient)
    });

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = formMethods;

    const formRef = useRef<HTMLFormElement | null>(null);

    const {
        image,
        video,
        links,
        tag,
        blob,
        setter
    } = useCustomReducer<MediaLinksTags>({
        image: "",
        video: "",
        links: [],
        tag: "",
        blob: null,
    });

    const addTag = (tag: string) => {
        setter({ tag });
    }

    const addLink = (data: LinkSchema) => {
        if (links.find(el => el.label === data.label || el.url === data.url)) return;
        setter({ links: [...links, data] });
    }

    const removeLink = (obj: LinkSchema) => {
        setter({ links: links.filter(el => el.url != obj.url) });
    }

    const getImage = (img: Blob | string) => {
        setter({ image: "", blob: null, video: "" });
        if (typeof img === "string")
            setter({ image: img });
        else
            setter({ blob: img, image: URL.createObjectURL(img) });
    }

    const getVideo = (vid: Blob | string) => {
        setter({ image: "", blob: null, video: "" });
        if (typeof vid === "string")
            setter({ video: vid });
        else
            setter({ blob: vid, video: URL.createObjectURL(vid) });
    }

    const submitForm = async (data: PostSchemaClientType) => {
        const file_type = image ? "image" : video ? "video" : null;
        const file = file_type && blob ? new File([new Uint8Array(await blob.arrayBuffer())], "Popcorn Paragon", { type: "image/webp" }) : null;
        const file_url = image || video || null;
        const formData: PostSchemaServerType = {
            ...data,
            tag,
            links,
            file_type,
            file_url,
            file,
        }
        const resp = await createPost(objectToFormData(formData), thread_id);
        console.log(resp);
    }

    const requestSubmit = () => {
        if (formRef.current) formRef.current.requestSubmit();
    }

    const options: any[] = [
        { label: "Tag", args: { popovertarget: "tag-popover" } },
        links.length < 5 && { label: "Link", args: { popovertarget: "link-popover" } },
        (!image && !video) && { label: "Video", args: { popovertarget: "video-popover" } },
        (!image && !video) && { label: "Image", args: { popovertarget: "image-popover" } },
    ].filter(Boolean);

    return (
        <>
            <header className="h-16 -mt-4 mb-4 flex items-center gap-4">
                <button className="iconBtn">
                    <XmarkIcon />
                </button>
                <h1 className="inline text-2xl">New Post</h1>
                <OptionMenu ButtonElement={<AddIcon />} place="end" className="ml-auto iconBtn" controls="manual" heading="Add">
                    <ul>
                        {options.map(el => (
                            <li key={el.label} className="w-full md:hover:bg-gray-500 md:hover:bg-opacity-30 transition-colors border-b border-gray30 ">
                                <button
                                    className="smallBtn w-full text-left capitalize py-3 px-4"
                                    {...el.args}
                                >
                                    {el.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </OptionMenu>
                <button className="primary" disabled={isSubmitting} onClick={requestSubmit}>{isSubmitting ? "Posting" : "Post"}</button>
            </header>

            {tag &&
                <section className="flex mb-4 gap-2">
                    <span className="flex gap-2 items-center py-2 px-3 rounded-full bg-gray10 select-none">
                        <AlertIcon classnames="h-4" />
                        <span className="text-sm">{tag}</span>
                    </span>
                </section>
            }

            <FormProvider {...formMethods}>
                <Form schema={postSchemaClient} ref={formRef} submit={submitForm}>
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
            </FormProvider>

            <MediaInputCont type="image" callback={getImage} popover="auto" id="image-popover" />
            <MediaInputCont type="video" callback={getVideo} popover="auto" id="video-popover" />
            <LinkInputCont popover="auto" id="link-popover" func={addLink} />
            <ThreadTagList popover="auto" id="tag-popover" func={addTag} />

            {!!links.length &&
                <section className="my-4 overflow-x-auto flex gap-4 noScroll">
                    {links.map(el => (
                        <div key={el.url} className="px-2 py-3 flex gap-2 bg-gray10 rounded-md">
                            <LinkIcon classnames="h-4 text-zinc-500" />
                            <span className="text-sky-500 text-nowrap">
                                {el.url}
                            </span>
                            <button className="smallBtn" onClick={() => removeLink(el)}>
                                <XmarkIcon classnames="h-4" />
                            </button>
                        </div>
                    ))}
                </section>
            }
            {image &&
                <section className="my-4 relative">
                    <button className="absolute z-[1] p-2 rounded-md bg-gray40 iconBtn right-0 top-0" onClick={() => setter({ image: "" })}>
                        <XmarkIcon classnames="h-4" />
                    </button>
                    <Image className="w-full h-64 object-contain" style={{ backgroundImage: `url(${placeholder})` }} src={image} alt="" width={500} height={500} />
                </section>
            }
            {video &&
                <section className="my-4 relative">
                    <button className="absolute z-[1] p-1 rounded-md bg-gray40 iconBtn right-0 top-0" onClick={() => setter({ video: "" })}>
                        <XmarkIcon classnames="h-4" />
                    </button>
                    <VideoPlayer src={video} />
                </section>
            }

            <p className="text-zinc-500 text-center mt-4">If any content (title, body, links, image or video) in this post contains Spoilers or NSFW content, please use the relevent tags or your post will be flagged as inappropriate.</p>

        </>
    )
}