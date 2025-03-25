"use client";

import { AddIcon, LinkIcon, XmarkIcon } from "@assets/Icons";
import { LinkInputCont, MediaInputCont } from "@components";
import { Form, Input, Poster, Textarea, ToggleButton } from "@components/form";
import { NotFound } from "@components/ui";
import { createThread } from "@lib/actions/clientActions";
import { useCustomReducer } from "@lib/hooks";
import { type LinkSchema, threadSchemaClient } from "@lib/schemas";
import useCurrentUser from "@store/user";
import { InputFrame } from "@type/internal";
import { useRef } from "react";

export default function Page() {

    const formRef = useRef<HTMLFormElement | null>(null);

    const {
        links,
        poster,
        setter
    } = useCustomReducer<{
        links: LinkSchema[],
        poster: InputFrame | null,
    }>({
        links: [],
        poster: null,
    });

    const { user, setUserHash } = useCurrentUser();
    if (!user) return (
        <NotFound
            title="Unauthorized access! You are not allowed to create a thread."
            paras={["Please log-in first to create a thread"]}
        />
    )

    const submit = async (formData: any) => {
        if (!links.length) return "At least one link is required to create a thread.";

        const file = poster && !poster.isExternal ? new File(
            [new Uint8Array(await poster.blob.arrayBuffer())],
            `Poster of ${formData.name} thread - Popcorn Paragon`,
            { type: "image/webp" })
            : null;

        const fileData = poster ? { ...poster, blob: undefined } : null
        const { name, description, nsfw, tags } = formData;
        const data = {
            name,
            description,
            files: file ? [file] : [],
            nsfw,
            tags,
            links,
            filesData: fileData ? [fileData] : [],
        };
        return createThread({ user, setUserHash, data });
    };

    const addLink = async (link: LinkSchema) => {
        if (links.find(el => el.url === link.url) || links.length >= 5) return;
        setter({ links: [...links, link] });
    }

    const getImage = (poster: InputFrame[]) => {
        setter({ poster: poster.pop() });
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
                <Poster className="size-48 mx-auto" picture={poster?.url || ""} removePicture={() => setter({ poster: null })} />

                <Form
                    schema={threadSchemaClient}
                    ref={formRef}
                    submit={submit}
                    className="space-y-6"
                >
                    <Input
                        name="name"
                        placeholder="Eg: Spider_Man"
                        label="Name"
                        description="No white spaces or special symbols are allowed except underscore ( _ )"
                        required
                        minLength={5}
                        maxLength={30}
                    />

                    <Textarea
                        name="description"
                        label="Description"
                        placeholder="Eg: About the thread and rules if any."
                        required
                        maxLength={500}
                    />
                    <p className="text-zinc-500 text-center text-sm">A name and description help people understand what the thread is about.</p>

                    <Textarea
                        name="tags"
                        label="Tags"
                        className="placeholder:text-sm"
                        description="Tags help users find a thread easily. 10 tags are allowed for now."
                        placeholder="Eg: spider_man, comics, character, miles_morales, marvel, sony..."
                        maxLength={500}
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
                        <li key={el.url} className="flex items-center gap-4 bg-gray30 border border-gray40 rounded-md py-2 px-3">
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

            <LinkInputCont popover="auto" id="link-popover" func={addLink} />
            <MediaInputCont popover="auto" id="poster-picker" type="image" callback={getImage} />
        </>
    )
}