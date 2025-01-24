"use client";

import { LeftChevron, LinkIcon, XmarkIcon } from "@assets/Icons";
import { LinkInputCont } from "@components";
import { LinkSchema } from "@lib/schemas";
import { useRef, useState } from "react";
import { Form, Textarea, ToggleButton } from "@components/form"
import { z } from "zod";

const linkPostSchema = z.object({
    caption: z.string()
        .max(800, "Caption cannot have more than 800 characters."),
    nsfw: z.boolean().default(false),
    spoiler: z.boolean().default(false),
});

type LinkPostSchemaType = z.infer<typeof linkPostSchema>;

export default function Page() {

    const [links, setLinks] = useState<LinkSchema[]>([]);
    const formRef = useRef<HTMLFormElement | null>(null);

    const getLinks = async (link: LinkSchema) => {
        if (links.find(el => el.label === link.label || el.link === link.link) || links.length >= 10) return;
        setLinks([...links, link]);
    }

    const deleteLink = (link: string) => {
        setLinks(links.filter(el => el.link !== link));
    }

    const requestSubmit = () => {
        if (formRef.current) formRef.current.requestSubmit();
    }

    const submit = (data: LinkPostSchemaType) => {
        if (!links.length) return { success: false, error: { name: "custom", error: new Error("A link is required to continue") } };
        console.log({ ...data, links })
        return { success: true, error: null }
    }

    return (
        <>
            <header className="h-14 flex flex-cntr-between">
                <div className="inline-flex gap-4">
                    <button className="smallBtn">
                        <LeftChevron />
                    </button>
                    <h2 className="text-2xl">Upload Links</h2>
                </div>
                <button
                    className="primary"
                    onClick={requestSubmit}
                >
                    Post
                </button>
            </header>
            <LinkInputCont classes="mx-auto" func={getLinks} />
            <Form ref={formRef} submit={submit} schema={linkPostSchema}>
                <Textarea
                    maxLength={800}
                    label="Caption"
                    name="caption"
                    description="You can describe what's in the attached links here to help users."
                    placeholder="Caption related to attached links."
                />
                <ToggleButton label="nsfw" className="py-4 border-b border-gray20 uppercase" />
                <ToggleButton label="spoiler" className="py-4 border-b border-gray20 capitalize" />
            </Form >
            <p className="mt-4 text-gray-500 text-center text-sm">
                Use relevant tags if the caption or attached links contain Spoiler or NSFW content.
            </p>
            <ul className="mt-4 gap-4 flex overflow-x-auto noScroll">
                {links.map(el => (
                    <li key={el.link} className="inline-flex gap-3 rounded-md p-3 bg-gray20">
                        <LinkIcon classnames="h-4" />
                        <span className="text-sky-500 text-nowrap">{el.link}</span>
                        <button className="smallBtn" onClick={() => deleteLink(el.link)}>
                            <XmarkIcon classnames="h-4" />
                        </button>
                    </li>
                ))}
            </ul>
        </>
    )
}