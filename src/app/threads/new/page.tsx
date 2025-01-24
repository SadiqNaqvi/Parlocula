"use client";

import { AddIcon, EditIcon, LinkIcon, XmarkIcon } from "@assets/Icons";
import { LinkInputCont, MediaInputCont } from "@components";
import { ToggleButton, Form, Input, Textarea } from "@components/form"
import { useCustomReducer } from "@lib/hooks";
import { LinkSchema, threadSchemaClient } from "@lib/schemas";
import { objectToFormData } from "@lib/utils";
import axios from "axios";
import Image from "next/image";
import { useRef } from "react";

export default function Page() {

    const formRef = useRef<HTMLFormElement | null>(null);

    const {
        links,
        poster,
        blob,
        error,
        setter
    } = useCustomReducer<{
        links: LinkSchema[],
        poster: string,
        blob: Blob | null
        error: string;
    }>({
        links: [],
        poster: '',
        blob: null,
        error: ""
    });

    const setError = (err: string) => {
        setter({ error: err });
        setTimeout(() => setter({ error: "" }), 3000)
    }

    const submit = async (data: any) => {
        if (!links.length) {
            setError("At least one link is required to create a thread.");
            return;
        };

        const file = blob ? new File(
            [new Uint8Array(await blob.arrayBuffer())],
            `Poster of ${data.title} thread - Popcorn Paragon`,
            { type: "image/webp" })
            : null;

        const media = !!(blob || poster) ? {
            type: "image", url: poster
        } : null;
        const { title, description, nsfw } = data;
        const formData = objectToFormData({
            title,
            description,
            file,
            nsfw,
            links,
            media,
            created_by: '6738cc6810eda2b001de97ba'
        });
        try {
            const resp = await axios.post("/api/threads/new", formData);
            console.log(resp);
        } catch (err: any) {
            console.error(err);
        }
    };

    const addLink = async (link: LinkSchema) => {
        if (links.find(el => el.url === link.url)) return;
        else if (links.length >= 5) {
            return;
        }
        setter({ links: [...links, link] });
    }

    const getImage = (file: Blob | string) => {
        setter({ poster: "", blob: null });
        if (typeof file === "string")
            setter({ poster: file });
        else
            setter({ blob: file, poster: URL.createObjectURL(file) });
    }

    const removeLink = (item: string) => {
        setter({ links: links.filter(el => el.url !== item) })
    }

    const requestSubmit = () => {
        formRef.current && formRef.current.requestSubmit();
    }

    return (
        <>
            <section className="space-y-3">
                <div className="ml-6 -mt-20 rounded-full *:rounded-full size-20 md:size-40 relative aspect-square p-1 bg-primarylight border border-dashed border-gray-500">
                    {poster &&
                        <Image
                            className="size-full object-cover"
                            src={poster}
                            alt=""
                            width={160} height={160}
                        />
                    }
                    <button
                        popoverTarget="media-popover"
                        className={`z-[1] smallBtn absolute inset-0 flex flex-cntr-all pointer ${poster ? "backdrop-brightness-50" : ''}`}
                    >
                        <EditIcon />
                    </button>
                </div>

                <Form
                    schema={threadSchemaClient}
                    ref={formRef}
                    submit={submit}
                    className="space-y-3"
                >
                    <Input
                        name="name"
                        placeholder="Eg: Spider_Man"
                        label="Name"
                        description="No white spaces or special symbols are allowed except underscore ( _ )"
                        required
                        minLength={5}
                        maxLength={25}
                    />

                    <Textarea
                        name="description"
                        label="Description"
                        placeholder="Eg: What the thread is about. Other points you like to mention. Rules if any."
                        required
                        maxLength={500}
                    />
                    <p className="text-zinc-500 text-center">A name and description help people understand what the thread is about.</p>

                    <Textarea
                        name="tags"
                        label="Tags"
                        placeholder="Eg: spider_man, comics, character, miles_morales, marvel, sony, tom_holland, andrew_garfield, tobey_maguire"
                        maxLength={300}
                    />

                    <ToggleButton label="nsfw" className="py-4 uppercase" />
                    <p className="text-sm text-center text-zinc-500 -mt-2 mb-4">If any of the content (title, description, poster or attached links) contains NSFW content or you want to make a NSFW Thread, please mark the above tag as true.</p>
                </Form>
            </section>

            <section className="mt-6">
                <div className="flex flex-cntr-between">
                    <h2 className="text-2xl uppercase font-semibold">Related Links</h2>
                    <button className="smallBtn" popoverTarget="link-popover">
                        <AddIcon />
                    </button>
                </div>
                <ul className="flex gap-4 my-4">
                    {links.map(el => (
                        <li key={el.url} className="flex items-center">
                            <LinkIcon classnames="h-4" />
                            <span>{el.url}</span>
                            <button
                                className="smallBtn p-1 rounded-md bg-gray20"
                                onClick={() => removeLink(el.url)}
                            >
                                <XmarkIcon classnames="h-4" />
                            </button>

                        </li>
                    ))}
                </ul>
            </section>

            <button className="my-6 primary ml-auto" onClick={requestSubmit}>Create Thread</button>

            {error && <p className="text-center-text-red-500">{error}</p>}

            <LinkInputCont popover="auto" id="link-popover" func={addLink} />
            <MediaInputCont popover="auto" id="media-popover" type="image" callback={getImage} />
        </>
    )
}