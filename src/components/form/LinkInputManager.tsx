
"use client";

import { linkSchema } from "@lib/schemas";
import { LinkSchema } from "@type/schemas";
import { Form, Input } from ".";
import Modal, { closeFancyBox } from "../Modal";
import { forwardRef, useImperativeHandle, useState } from "react";
import { AddIcon, XmarkIcon } from "@assets/Icons";
import { InputManagerType } from "@type/other";

export const InputPrompt = ({ func, classes = "", }: { func: any, classes?: string, }) => {

    const submitLink = (data: LinkSchema) => {
        func(data);
        closeFancyBox();
    }

    return (
        <Form
            className={"w-96 max-w-full *:w-full text-inherit p-2 rounded-md bg-primarylight border border-dashed border-gray-500" + " " + classes}
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

const RemovalLinkTile = ({ func, title }: { func: () => void, title: string }) => {
    return (
        <li className="flex p-2 rounded-md bg-gray10 items-center gap-3 min-w-fit whitespace-nowrap">
            <span className="text-sky-500">{title}</span>
            <button onClick={func} type="button" className=" border border-gray30 bg-gray20 p-1 rounded-md">
                <XmarkIcon className="h-2" />
            </button>
        </li>
    )
}

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
        <div className="flex flex-cntr-between">
            <div>
                {links.length ?
                    <ul className="flex gap-2 overflow-x-auto noScroll">
                        {links.map(link => (
                            <RemovalLinkTile func={() => removeLinks(link.path)} key={link.path} title={link.label} />
                        ))}
                    </ul>
                    :
                    <h4 className="capitalize">{title ?? "Attach Links"}</h4>
                }
            </div>
            <Modal id="link-input" buttonChildren={<AddIcon />} className={`iconBtn ${links.length >= limit ? "fadeToNone" : ""}`}>
                <InputPrompt func={getLinks} />
            </Modal>
        </div>
    )

});

export default LinkInputManager;