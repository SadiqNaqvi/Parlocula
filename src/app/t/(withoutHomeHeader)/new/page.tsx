"use client";

import { AddIcon } from "@assets/Icons";
import { Navbar } from "@components";
import { Form, Input, Poster, Textarea, ToggleButton } from "@components/form";
import LinkInputManager from "@components/form/LinkInputManager";
import { Triggerer } from "@components/FancyboxModal";
import { LoadingSpinner, NotFound } from "@components/ui";
import { createThread } from "@lib/helpers/client";
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
    const connectionsRef = useRef<InputManagerType>(null);

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
        const connections = connectionsRef.current?.getData();
        if (!connections || !connections.length || connections.length > 10) {
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

    return (
        <>
            <Form
                schema={threadSchemaClient}
                ref={formRef}
                submit={submit}
                className="space-y-6"
            >
                <Navbar navTitle="Create Thread"
                    OptionButton={<button type="submit" className="primary" onClick={requestSubmit}>Create</button>}
                />

                <Poster ref={posterRef} />

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

            <section className="my-6 space-y-4">
                <ConnectionsInput ref={connectionsRef} />
                <ul className="text-sm space-y-1 text-zinc-500">
                    <li>Help others understand what your thread is about by linking it to relevant Celebrities, Movies, or Shows.</li>
                    <li>This helps your thread show up in the right places and reach the right fans.</li>
                    <li>You must add at least 1 and at most 10 connections to continue.</li>
                </ul>
            </section>

            <LinkInputManager ref={linksRef} />

        </>
    )
}