"use client";

import { EditIcon } from "@assets/Icons";
import { BottomSheet, BottomSheetRef, Navbar } from "@components";
import { Form, Input, LinkInputManager, Poster, Textarea, ToggleButton } from "@components/form";
import LoginPopupSheet from "@components/sheets/LoginPopupSheet";
import { PrimaryButton, ThreadPageMockup } from "@components/ui/mockup";
import { createThreadMutation } from "@lib/helpers/mutations";
import appToast from "@lib/providers/toast";
import { threadSchemaClient } from "@lib/schemas";
import { parloId, readyFrames } from "@lib/utils";
import { useNavigation } from "@store/historystack";
import useCurrentUser from "@store/user";
import { InputManagerType } from "@type/other";
import { ThreadSchemaServer } from "@type/schemas";
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
        <BottomSheet button="Good To Know" className="px-2 py-1 bg-gray10 border border-gray20 rounded-md">
            {goodToKnowSections.map(({ descriptions, title }, ind) => (
                <section className="my-6 space-y-4 px-2" key={ind}>
                    <h4 className="font-semibold text-lg text-center">{title}</h4>
                    <ul className="space-y-1 list-disc text-sm">
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
    const loginSheetRef = useRef<BottomSheetRef>(null);

    const navigation = useNavigation();

    const { meta } = useCurrentUser();

    const submit = async (data: Pick<ThreadSchemaServer, "name" | "description" | "nsfw">) => {

        if (!meta) {
            loginSheetRef.current?.open();
            return;
        }

        const connections = connectionsRef.current?.getData();

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
            <Form
                schema={threadSchemaClient}
                ref={formRef}
                submit={submit}
                className="px-2"
                skipReset
            >

                <section className="flex gap-2 md:gap-4 items-center">
                    <Poster ref={posterRef} className="mx-0 min-w-24 size-24 md:min-w-36 md:size-36" />

                    <div className="flex-1 space-y-1 md:space-y-2">
                        <div className="flex gap-2 items-center w-full group">
                            <EditIcon className="text-gray-500 group-has-[:focus]:text-inherit" />
                            <Input
                                name="name"
                                placeholder="Display Name"
                                className="p-0 border-0 sm:text-xl font-semibold flex-1"
                                required
                                minLength={5}
                                maxLength={30}
                            />
                        </div>
                        <p className="text-sm text-zinc-500">Created by: @{meta?.username || "you"}</p>
                    </div>
                </section>
                <section className="space-y-2 my-4">
                    <ul className="h-fit flex-wrap whitespace-nowrap mt-2 text-sm text-zinc-500 flex space-x-2">
                        <li>Created Now</li>
                        <li>~</li>
                        <li>X Members</li>
                        <li>~</li>
                        <li>X Posts</li>
                    </ul>

                    <div className="flex gap-2 items-center">
                        <ToggleButton label="nsfw" className="uppercase" />
                        <GoodToKnowButton />
                    </div>
                </section>

                <div className="flex my-6 gap-2 group">
                    <EditIcon className="size-4 mt-1 text-gray-500 group-has-[:focus]:text-inherit" />
                    <Textarea
                        name="description"
                        placeholder="Description - about thread, rules, etc."
                        required
                        containerClassName="border-0 flex-1 h-fit"
                        className="py-1 h-fit"
                        maxLength={500}
                    />
                </div>

            </Form>
            <section className="px-2 space-y-4 mt-4">
                    <LinkInputManager ref={linksRef} />

                <div>
                    <ConnectionsInput connectionsRef={connectionsRef} />
                    <p className="text-sm text-gray-500">You can optionally connect this thread to the movies, shows or artists it is based on. If connected, the thread would be shown on these connected wiki page.</p>
                </div>
            </section>

            <div className="flex px-2 mt-4">
                <PrimaryButton>Follow</PrimaryButton>
            </div>

            <LoginPopupSheet href="/thread/new" sheetRef={loginSheetRef} section="thread details" />

            <ThreadPageMockup />
        </>
    )
}

export default CreateNewThreadPage;