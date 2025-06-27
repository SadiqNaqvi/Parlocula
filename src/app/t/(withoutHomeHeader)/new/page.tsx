"use client";

import { AddIcon } from "@assets/Icons";
import { Navbar } from "@components";
import { Form, Input, Poster, Textarea, ToggleButton } from "@components/form";
import LinkInputManager from "@components/form/LinkInputManager";
import { Popover, Triggerer } from "@components/Modal";
import { LoadingSpinner, NotFound } from "@components/ui";
import { createThread } from "@lib/helpers/client";
import { useCustomReducer } from "@lib/hooks";
import { threadSchemaClient } from "@lib/schemas";
import { readyFrames } from "@lib/utils";
import useCurrentUser from "@store/user";
import { InputManagerType } from "@type/other";
import { ThreadConnectionType } from "@type/schemas";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import toast from "react-hot-toast";
import ConnectionsInput from "./ConnectionsInput";

export default function Page() {

    const formRef = useRef<HTMLFormElement | null>(null);

    const {
        connections,
        setter
    } = useCustomReducer({
        connections: [] as ThreadConnectionType[],
    });

    const posterRef = useRef<InputManagerType>(null);
    const linksRef = useRef<InputManagerType>(null);

    const router = useRouter();

    const { user, updateThreads, isHydrated } = useCurrentUser();

    if (!isHydrated) return <LoadingSpinner />

    if (!user) return (
        <NotFound
            title="Unauthorized access! You are not allowed to create a thread."
            paras={["Please log-in first to create a thread"]}
        />
    )

    const submit = async (formData: any) => {

        if (!connections.length || connections.length > 10) {
            toast.error("At least 1 connections are required to create a thread. Upto 10 connections are allowed.")
            return;
        }

        const poster = posterRef.current?.getData();
        const links = linksRef.current?.getData();

        const { files, filesData } = await readyFrames(poster ? [poster] : [])
        const { name, description, nsfw } = formData;
        const data = {
            name,
            description,
            nsfw,
            links,
            files,
            filesData,
            connections
        };
        return await createThread(data, user._id, router, updateThreads);
    };

    const requestSubmit = () => {
        formRef.current && formRef.current.requestSubmit();
    }

    const getConnections = (c: ThreadConnectionType[]) => {
        setter({ connections: c });
    }

    return (
        <>
            <Navbar navTitle="Create Thread" OptionButton={
                <button className="my-6 primary ml-auto" onClick={requestSubmit}>Create</button>
            } />

            <section className="space-y-3 mt-4">

                <Poster ref={posterRef} />

                <Form
                    schema={threadSchemaClient}
                    ref={formRef}
                    submit={submit}
                    className="space-y-6"
                >
                    <Input
                        name="name"
                        placeholder="Eg: Spider Man"
                        label="Name"
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

                    <ToggleButton label="nsfw" className="w-full py-4 uppercase" />

                    <p className="text-sm text-center text-zinc-500 -mt-2 mb-4">Turn the above on if this thread is going to be a NSFW thread.</p>
                </Form>

            </section>

            <section className="my-6 space-y-4">

                <div className="flex flex-cntr-between">
                    <h2 className="text-2xl uppercase font-semibold">Add Connections</h2>
                    <Triggerer id="connection-input"><AddIcon /></Triggerer>
                </div>

                {Boolean(connections.length) ?
                    <ul className="flex gap-3 flex-1 overflow-x-auto noScroll">
                        {connections.map(({ path, name }) => (
                            <li key={path} className="inline-flex text-sm gap-3 whitespace-nowrap text-nowrap flex-cntr-between px-2 py-2 rounded-md bg-gray20 border border-gray30">
                                {name}
                            </li>
                        ))}
                    </ul>
                    :
                    <ul className="text-sm space-y-1 text-zinc-500">
                        <li>Help others understand what your thread is about by linking it to relevant Celebrities, Movies, or Shows.</li>
                        <li>This helps your thread show up in the right places and reach the right fans.</li>
                        <li>You must add at least 1 and at most 10 connections to continue.</li>
                    </ul>
                }
            </section>

            <LinkInputManager ref={linksRef} />

            <Popover id="connection-input">
                <ConnectionsInput callback={getConnections} />
            </Popover>

        </>
    )
}