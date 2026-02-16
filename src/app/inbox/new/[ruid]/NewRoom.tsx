"use client";

import { LeftChevron, SendIcon } from "@assets/Icons";
import { Form, Input } from "@components/form";
import { ParloImage } from "@components/ui";
import { createRoomMutation } from "@lib/helpers/mutations";
import { getPoster, parloId } from "@lib/utils";
import { useNavigation } from "@store/historystack";
import { MereUser } from "@type/internal";
import Image from "next/image";
import { useRef } from "react";
import { Drawer } from "vaul";

const NewRoom = ({ ruser }: { ruser: MereUser }) => {

    const formRef = useRef<HTMLFormElement>(null);
    const navigation = useNavigation();

    const createRoom = async ({ content }: { content: string }) => {

        const inviteMessage = content?.trim();
        if (!inviteMessage || !inviteMessage.length) return;
        const ruid = ruser._id;

        const rmid = parloId();

        createRoomMutation(
            rmid,
            {
                files: [],
                filesData: [],
                inviteMessage,
                participants: [ruid],
                type: "private",
                display_name: ruser.username,
                poster: ruser.profile?.path,
            },
            ruid
        );

        navigation.goto(`/inbox/${rmid}`);

        formRef.current?.reset();
    }

    return (
        <>
            <header className="border-b border-gray40 flex py-4 px-2 items-center gap-4">
                <Drawer.Close>
                    <LeftChevron />
                </Drawer.Close>
                <div className="flex gap-4 items-center">
                    <ParloImage
                        frameType="userProfile"
                        containerClassName="rounded-full overflow-hidden"
                        frame={ruser.profile}
                        size={48}
                        alt="Poster of room"
                    />

                    <h1>{ruser.username}</h1>
                </div>
            </header>
            <section className="p-4 min-h-[25dvh]">
                <p className="text-center text-zinc-500">Invite this user to chat with you. You can only send 1 message, make it worth.</p>
            </section>
            <footer className="w-stretch fixed bottom-0 px-2 py-4">
                <Form
                    ref={formRef}
                    className="flex items-center gap-2"
                    submit={createRoom}>
                    <Input
                        placeholder="Send Message"
                        enterKeyHint="send"
                        name="content"
                        maxLength={3000}
                        className="flex-1 border border-invert p-3 bg-transparent rounded-2xl"
                    />
                    <button type="submit" className="size-fit p-2">
                        <SendIcon />
                    </button>
                </Form>
            </footer>
        </>
    )

}

export default NewRoom;