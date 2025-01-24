"use client";

import { AddIcon, EditIcon, LeftChevron, LinkIcon, XmarkIcon } from "@assets/Icons";
import { LinkInputCont, MediaInputCont } from "@components";
import { ToggleButton } from "@components/form"
import { zodResolver } from "@hookform/resolvers/zod";
import { useCustomReducer } from "@lib/hooks";
import { createMediaPost } from "@lib/postActions";
import { LinkSchema, mediaPostServerSchema, MediaPostServerSchemaType } from "@lib/schemas";
import { objectToFormData } from "@lib/utils";
import Image from "next/image";
import { useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const mediaSchema = z.object({
    caption: z.string()
        .max(800, "Caption cannot have more than 800 characters"),
    nsfw: z.boolean().default(false),
    spoiler: z.boolean().default(false),
});

type MediaSchemaType = z.infer<typeof mediaSchema>;

export default function Page({ params }: { params: { id: string } }) {

    const formMethods = useForm<MediaSchemaType>({ resolver: zodResolver(mediaSchema) });

    const { register, handleSubmit, formState: { errors, isSubmitting } } = formMethods;

    const {
        image,
        video,
        type,
        blob,
        links,
        setter,
    } = useCustomReducer<{
        image: string,
        video: string,
        type: "image" | "video" | "",
        blob: Blob | null,
        links: LinkSchema[],
    }>({
        image: "",
        video: "",
        type: "",
        blob: null,
        links: [],
    });

    const formRef = useRef<HTMLFormElement | null>(null);

    const getMedia = (file: Blob | string, type: "image" | "video") => {
        setter({ image: "", blob: null, video: "" });
        if (typeof file === "string") {
            type === "image" ?
                setter({ image: file, type })
                :
                setter({ video: file, type });
        }
        else {
            type === "image" ?
                setter({ blob: file, image: URL.createObjectURL(file), type })
                :
                setter({ blob: file, video: URL.createObjectURL(file), type });
        }
    }

    const addLink = (link: LinkSchema) => {
        if (links.find(el => el.label === link.label || el.link === link.link) || links.length >= 2) return;
        setter({ links: [...links, link] });
    }

    const removeLink = (link: string) => {
        setter({ links: links.filter(el => el.link !== link) });
    }

    const submit = async (data: MediaSchemaType) => {
        if (!type) return;
        const file = type && blob ? new File([new Uint8Array(await blob.arrayBuffer())], "Popcorn Paragon", { type: "image/webp" }) : null;
        const file_url = image || video || null;

        if (!file && !file_url) return;

        const formData: MediaPostServerSchemaType = {
            ...data,
            links,
            file_type: type,
            file_url,
            file,
        };

        const resp = await createMediaPost(objectToFormData(formData), params.id);
        console.log(resp);
    }

    const requestSubmit = () => {
        if (formRef.current) formRef.current.requestSubmit();
    }


    return (
        <>
            <div>
                <header className="mb-4 -mt-4 h-16 flex flex-cntr-between">
                    <div className="inline-flex items-center gap-4">
                        <LeftChevron />
                        <h1 className="text-xl">Upload Media</h1>
                    </div>
                    <button
                        className="primary"
                        disabled={isSubmitting}
                        onClick={requestSubmit}
                    >
                        {isSubmitting ? "Posting" : "Post"}
                    </button>
                </header>

                <div className="max-w-screen-md mx-auto h-64 bg-gray20 rounded-xl">
                    {(image || video) ?
                        <div className="size-full relative">
                            <button
                                onClick={() => setter({ image: "", video: "", type: "" })}
                                className="absolute z-[1] iconBtn top-0 right-0 mr-2 mt-2 p-2 bg-gray30 rounded-xl"
                            >
                                <XmarkIcon />
                            </button>
                            {type === "image" ?
                                <Image
                                    className="size-full z-[1] object-contain rounded-xl"
                                    src={image}
                                    alt=""
                                    height={1000} width={1000} />
                                :
                                <video className="size-full object-contain">
                                    <source src={video} />
                                </video>
                            }
                        </div>
                        :
                        <button
                            popoverTarget="choice-popover"
                            className="smallBtn size-full pointer flex gap-8 flex-col flex-cntr-all">
                            <EditIcon classnames="h-10" />
                        </button>
                    }
                </div>
                <p className="mt-2 text-zinc-500 text-center text-sm">You can only upload 1 image/video as for now. If you want to add multiple assets, please use a media host like Google drive, Mega, etc. and attach the link.</p>

                <FormProvider {...formMethods}>
                    <form ref={formRef} className="mt-8 space-y-4" onSubmit={handleSubmit(submit)}>
                        <div className="w-full pb-2 space-y-3 border-b border-gray20">
                            <label htmlFor="description" className="text-sm text-gray-500">Caption</label>
                            <textarea
                                {...register("caption")}
                                name="caption"
                                maxLength={800}
                                minLength={15}
                                className="w-full"
                                placeholder="Caption for the attached media">
                            </textarea>
                            {errors.caption && errors.caption.message &&
                                <p className="text-red-500 text-sm">{errors.caption.message}</p>
                            }
                        </div>
                        <ToggleButton label="nsfw" className="py-4 uppercase" />
                        <ToggleButton label="spoiler" className="py-4 capitalize" />
                    </form>
                </FormProvider>

                <p className="my-4 text-zinc-500 text-center text-sm">Use relevant tags to warn users about the content of this post.</p>

                <div className="my-4 flex flex-cntr-between">
                    <h4 className="text-lg">Attach Links</h4>
                    <button
                        className="smallBtn"
                        popoverTarget="link-popover"
                    >
                        <AddIcon />
                    </button>
                </div>
                <ul className="my-4 flex gap-4 overflow-x-auto noScroll">
                    {links.map(el => (
                        <li key={el.link} className="inline-flex items-center gap-2 bg-gray20 p-2 rounded-md">
                            <LinkIcon classnames="h-4 text-gray-500" />
                            <span className="text-sky-500 text-nowrap">{el.link}</span>
                            <button
                                className="smallBtn"
                                onClick={() => removeLink(el.link)}
                            >
                                <XmarkIcon classnames="h-4" />
                            </button>
                        </li>
                    ))}
                </ul>
                <p className="text-center text-zinc-500 text-sm">You can only add 2 links.</p>

            </div>

            <section popover="auto" id="choice-popover" className="bg-transparent text-inherit max-w-full">
                <div className="flex m-auto gap-8 p-8 bg-primary rounded-xl border border-dashed border-gray-500">
                    <button className="smallBtn w-48 max-w-[50%] aspect-square bg-gray20 rounded-lg" popoverTarget="image-popover">
                        Image
                    </button>
                    <button className="smallBtn w-48 max-w-[50%] aspect-square bg-gray20 rounded-lg" popoverTarget="video-popover">
                        Video
                    </button>
                </div>
            </section>

            <MediaInputCont popover="auto" id="image-popover" callback={(file) => getMedia(file, "image")} type="image" />
            <MediaInputCont popover="auto" id="video-popover" callback={(file) => getMedia(file, "video")} type="video" />
            <LinkInputCont popover="auto" id="link-popover" func={addLink} />
        </>
    )
}