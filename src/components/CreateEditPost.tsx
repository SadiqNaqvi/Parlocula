"use client";

import { AddIcon, AlertIcon, LinkIcon, XmarkIcon } from "@assets/Icons";
import placeholder from "@assets/placeholder.png";
import { LinkInputCont, MediaInputCont, OptionMenu, ThreadTagList } from "@components";
import { Form, Textarea, ToggleButton } from "@components/form";
import { useCustomReducer } from "@lib/hooks";
import { LinkSchema, postSchemaClient, postSchemaServer } from "@lib/schemas";
import { readyFrames } from "@lib/utils";
import { InputFrame } from "@type/internal";
import Image from "next/image";
import { useRef } from "react";

type MediaLinksTags = {
    frames: InputFrame[],
    links: LinkSchema[]
    tag: string,
}

type PostClientCommon = { title: string, body: string, nsfw: boolean, spoiler: boolean };

const CreateEditPost = ({ defaultVals, callback }: { defaultVals?: any, callback: (arg: any) => void }) => {

    const formRef = useRef<HTMLFormElement | null>(null);

    const {
        frames,
        links,
        tag,
        setter
    } = useCustomReducer<MediaLinksTags>({
        links: [],
        frames: [],
        tag: "",
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

    const getFrames = (frames: InputFrame[]) => {
        setter({ frames });
    }

    const removeFrame = (ind: number) => {
        setter({ frames: frames.filter((_, i) => i !== ind) });
    }

    const readyFormData = async (data: PostClientCommon) => {
        const { files, filesData } = await readyFrames(frames);
        return { ...data, tag, links, files, filesData };
    }

    const submitForm = async (data: PostClientCommon) => {
        const formData = await readyFormData(data);
        const { success, error } = postSchemaServer.safeParse(formData);
        if (!success) return error?.errors;

        callback(formData);
        // const resp = await createPost(objectToFormData(formData), thread_id);
        // console.log(resp);
    }

    const requestSubmit = () => {
        if (formRef.current) formRef.current.requestSubmit();
    }

    const options: any[] = [
        links.length < 5 && { label: "Link", args: { popovertarget: "link-popover" } },
        tag === "Frames" && { label: "Frames", args: { popovertarget: "frames-popover" } },
        (!frames.length && tag !== "Frames") && { label: "Video", args: { popovertarget: "video-popover" } },
        (!frames.length && tag !== "Frames") && { label: "Image", args: { popovertarget: "image-popover" } },
    ].filter(Boolean);

    return (
        <>
            <header className="h-16 -mt-4 mb-4 flex items-center gap-4">
                <button className="iconBtn">
                    <XmarkIcon />
                </button>
                <h1 className="inline text-2xl">New Post</h1>
                <OptionMenu ButtonElement={<AddIcon />} className="ml-auto iconBtn" controls="manual" heading="Add">
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
                <button className="primary" onClick={requestSubmit}>Post</button>
            </header>

            <section className="flex mb-4 gap-2">
                {tag ?
                    <span className="flex gap-2 items-center py-2 px-3 rounded-full bg-gray10 select-none">
                        <AlertIcon classnames="h-4" />
                        <span className="text-sm">{tag}</span>
                    </span>
                    :
                    <button className="smallBtn py-2 px-3 rounded-full bg-gray10" popoverTarget="tag-popover">Choose Tag</button>
                }
            </section>

            <Form defaultVals={defaultVals} className="space-y-4" schema={postSchemaClient} ref={formRef} submit={submitForm}>
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

            <MediaInputCont type="image" callback={getFrames} popover="auto" id="image-popover" />
            <MediaInputCont type="video" callback={getFrames} popover="auto" id="video-popover" />
            <MediaInputCont type="image" multiple={5} callback={getFrames} popover="auto" id="frames-popover" />
            <LinkInputCont popover="auto" id="link-popover" func={addLink} />
            <ThreadTagList popover="auto" id="tag-popover" func={addTag} />

            {
                !!links.length &&
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
            <section className="my-4 flex gap-4 overflow-x-auto">
                {frames.map((frame, ind) => (
                    <div className="relative bg-gray30 border border-gray40">
                        <button className="absolute z-[1] p-2 rounded-md bg-gray30 border border-gray40 iconBtn mt-1 mr-1 right-0 top-0" onClick={() => removeFrame(ind)}>
                            <XmarkIcon classnames="h-4" />
                        </button>
                        {frame.type === "image" ?
                            <Image className="size-64 object-contain" style={{ backgroundImage: `url(${placeholder})` }} src={frame.url} alt="" width={500} height={500} />
                            :
                            <video controls className="size-64 object-contain" src={frame.url} />
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