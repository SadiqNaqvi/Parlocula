"use client";

import { BottomSheet, Navbar } from "@components";
import LoginModal from "@components/fallbacks/LoginModal";
import { Form, Input, LinkInputManager, Poster, Textarea, ToggleButton } from "@components/form";
import { createThreadMutation } from "@lib/helpers/mutations";
import appToast from "@lib/providers/toast";
import { threadSchemaClient } from "@lib/schemas";
import { parloId, readyFrames } from "@lib/utils";
import { useNavigation } from "@store/historystack";
import useCurrentUser from "@store/user";
import { InputManagerType } from "@type/other";
import { ThreadSchemaServer } from "@type/schemas";
import { nanoid } from "nanoid";
import { useRef } from "react";
import ConnectionsInput from "./ConnectionsInput";

const goodToKnowSections = [
    {
        title: "Before you create a Thread",
        descriptions: [
            "A Thread is not just a page but a responsibility.",
            "A Thread should not be created for competetion, but only when it is needed.",
            "If a Thread, for the same purpose already exists, it is adviced not to create a duplicate.",
            "Creating a duplicate thread may flag you as a spammer."
        ],
    },
    {
        title: "Things to avoid as it may get you banned",
        descriptions: [
            "Choosing a NSFW poster. Poster should be SFW even if the thread is NSFW.",
            "NSFW Title. Title should also stay SFW even if the thread is NSFW. You can include the word 'NSFW' in the title.",
            "Creating a duplicate thread for the same purpose."
        ],
    },
    {
        title: "Things must to do to get your Thread popular",
        descriptions: [
            "Choosing a short and to the point Title.",
            "Title help users to identify the purpose of the thread.",
            "A well-defined description that include the purpose of your thread as well as rules if any.",
            "Do's and Dont's for memebers should also be mentioned in the description.",
            "Keeping the Thread SFW, since NSFW Threads are only shown to 18+ users and those who allow NSFW."
        ],
    }
]

const GoodToKnowButton = () => {
    return (
        <BottomSheet button="Good To Know">
            {goodToKnowSections.map(({ descriptions, title }, ind) => (
                <section className="my-3 space-y-3" key={ind}>
                    <h4 className="font-semibold text-sm upeercase">{title}</h4>
                    <ul className="space-y-2">
                        {descriptions.map((desc, i) => (
                            <li key={ind + '' + i}>{desc}</li>
                        ))}
                    </ul>
                </section>
            ))}
        </BottomSheet>
    )
}

const CreateNewThreadPage = () => {

    const formRef = useRef<HTMLFormElement | null>(null);
    const connectionsRef = useRef<InputManagerType>(null);
    const posterRef = useRef<InputManagerType>(null);
    const linksRef = useRef<InputManagerType>(null);

    const navigation = useNavigation();

    const { meta } = useCurrentUser();

    if (!meta) return (
        <LoginModal redirectTo="/thread/new" />
    )

    const submit = async (data: Pick<ThreadSchemaServer, "name" | "description" | "nsfw">) => {

        const connections = connectionsRef.current?.getData();

        if (!connections || !connections.length || connections.length > 10) {
            appToast.error("At least 1 connections are required to create a thread. Upto 10 connections are allowed.")
            return;
        }

        const poster = posterRef.current?.getData();
        const links = linksRef.current?.getData();

        const { files, filesData } = await readyFrames(poster ? [poster] : [])
        const { name, description, nsfw } = data;

        const tid = parloId();

        const error = await createThreadMutation(tid, meta.user_id, {
            _id: tid,
            name,
            description,
            nsfw,
            links,
            files,
            filesData,
            connections
        });

        if (error) return error;
        navigation.goto(`/thread/${tid}-${name}`);

    };

    const requestSubmit = () => {
        formRef.current && formRef.current.requestSubmit();
    }

    return (
        <>
            <Navbar
                navTitle="Create Thread"
                OptionButton={
                    <button type="submit" className="primary" onClick={requestSubmit}>Create</button>
                }
            />

            <Poster ref={posterRef} />

            <div className="flex justify-end">
                <GoodToKnowButton />
            </div>

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

                <ToggleButton label="nsfw" className="w-full py-4 uppercase" />

            </Form>

            <section className="my-6 space-y-4">
                <ConnectionsInput connectionsRef={connectionsRef} />
            </section>
            <LinkInputManager ref={linksRef} />

        </>
    )
}

export default CreateNewThreadPage;