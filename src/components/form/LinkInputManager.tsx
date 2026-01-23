
"use client";

import { AddIcon, LinkIcon, XmarkIcon } from "@assets/Icons";
import BottomSheet, { BottomSheetRef } from "@components/BottomSheet";
import { linkSchema } from "@lib/schemas";
import { InputManagerType, TypedFunction } from "@type/other";
import { LinkSchema } from "@type/schemas";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Form, Input } from ".";
import { OptionalChildren } from "@components/ui";
import { twMerge } from "tailwind-merge";

export const InputPrompt = ({ submit, className = "", }: { submit: TypedFunction<LinkSchema>, className?: string, }) => {

    return (
        <Form
            className={twMerge("w-full space-y-4 px-2", className)}
            submit={submit}
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

            <button className="secondary w-full" type="submit">Add</button>
        </Form>
    )
}

type Props = {
    title?: string,
    limit?: number,
    defaultLinks?: LinkSchema[],
}

const linkTileClassName = "flex py-1 px-2 rounded-md bg-gray10 border border-gray-20 border-dashed items-center gap-2 min-w-fit whitespace-nowrap";

const LinkTile = ({ remove, path }: { remove: TypedFunction<string>, path: string }) => (
    <li className={linkTileClassName}>
        <LinkIcon className="size-4" />
        <span className="text-sky-500">{path}</span>
        <button onClick={() => remove(path)} type="button" className=" border border-gray30 bg-gray20 p-1 rounded-md">
            <XmarkIcon className="h-2" />
        </button>
    </li>
)

const HollowLinkTile = () => (
    <li className={linkTileClassName}>
        <span className="text-zinc-500">Link</span>
        <AddIcon className="size-4" />
    </li>
)

const LinkInputManager = forwardRef<InputManagerType<LinkSchema[]>, Props>(({ title, limit = 5, defaultLinks }: Props, ref) => {

    const [links, setLinks] = useState<LinkSchema[]>(defaultLinks ?? []);
    const sheetRef = useRef<BottomSheetRef>(null);

    useImperativeHandle(ref, () => ({
        getData: () => links,
    }));

    const getLinks = (link: LinkSchema) => {
        if (links.length >= limit || (links.length && links.find(el => el.path === link.path)))
            return;

        setLinks([...links, link]);
        sheetRef.current?.close();
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
                        <BottomSheet ref={sheetRef} button={<HollowLinkTile />} key={i}>
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