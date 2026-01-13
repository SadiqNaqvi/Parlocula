
"use client";

import { AddIcon, LinkIcon, XmarkIcon } from "@assets/Icons";
import BottomSheet from "@components/BottomSheet";
import { linkSchema } from "@lib/schemas";
import { InputManagerType, TypedFunction } from "@type/other";
import { LinkSchema } from "@type/schemas";
import { forwardRef, useImperativeHandle, useState } from "react";
import { Form, Input } from ".";
import { OptionalChildren } from "@components/ui";

export const InputPrompt = ({ submit, classes = "", }: { submit: TypedFunction<LinkSchema>, classes?: string, }) => {

    const submitLink = (data: LinkSchema) => {
        submit(data);
    }

    return (
        <Form
            className={"w-96 max-w-full *:w-full space-y-4 text-inherit p-4 rounded-md bg-primarylight border border-dashed border-gray-500" + " " + classes}
            submit={submitLink}
            schema={linkSchema}
        >
            <Input
                required
                name="label"
                placeholder="label"
            />
            <Input
                required
                name="path"
                placeholder="path"
            />

            <button className="secondary mt-4" type="submit">Add</button>
        </Form>
    )
}

type Props = {
    title?: string,
    limit?: number,
    defaultLinks?: LinkSchema[],
}

const LinkTile = ({ remove, path }: { remove: TypedFunction<string>, path: string }) => (
    <li className="flex py-1 px-2 rounded-md bg-gray10 items-center gap-3 min-w-fit whitespace-nowrap">
        <LinkIcon className="size-3" />
        <span className="text-sky-500">{path}</span>
        <button onClick={() => remove(path)} type="button" className=" border border-gray30 bg-gray20 p-1 rounded-md">
            <XmarkIcon className="h-2" />
        </button>
    </li>
)

const HollowLinkTile = () => (
    <li className="flex py-1 px-2 rounded-md bg-gray10 border border-gray-20 border-dashed items-center gap-3 min-w-fit whitespace-nowrap">
        <LinkIcon className="size-3" />
        <span className="text-zinc-500">Link</span>
        <AddIcon className="size-2 p-1 bg-gray20 border border-gray-30" />
    </li>
)

const LinkInputManager = forwardRef<InputManagerType<LinkSchema[]>, Props>(({ title, limit = 5, defaultLinks }: Props, ref) => {

    const [links, setLinks] = useState<LinkSchema[]>(defaultLinks ?? []);

    useImperativeHandle(ref, () => ({
        getData: () => links,
    }));

    const getLinks = (link: LinkSchema) => {
        if ((links.length && links.find(el => el.path === link.path)) || links.length >= limit) return;
        setLinks([...links, link]);
    }

    const removeLinks = (path: string) => {
        setLinks(links.filter(el => el.path !== path));
    }

    return (
        <div className="flex gap-2 overflow-x-auto noScroll">
            <OptionalChildren condition={links.length}>
                <ul className="flex gap-2">
                    {links.map(({ path }) => (
                        <LinkTile remove={removeLinks} key={path} path={path} />
                    ))}
                </ul>
            </OptionalChildren>
            <OptionalChildren condition={links.length < limit}>
                <ul className="flex gap-2">
                    {Array(limit - links.length).fill(0).map((_, i) => (
                        <BottomSheet button={<HollowLinkTile />} key={i}>
                            <InputPrompt submit={getLinks} />
                        </BottomSheet>
                    ))}
                </ul>
            </OptionalChildren>
        </div>
    )

});

LinkInputManager.displayName = "LinkInputManager";

export default LinkInputManager;