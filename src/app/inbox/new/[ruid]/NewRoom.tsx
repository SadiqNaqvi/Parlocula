"use client";

import { useCreateRoomMutation } from "@lib/helpers/room/client";
import { LeftChevron, SendIcon } from "@assets/Icons";
import { Navigate } from "@components";
import MessageBar from "@components/ui/MessageBar";
import { getPoster, ObjectId } from "@lib/utils";
import { UserMetaData } from "@store/user";
import { MereUser } from "@type/internal";
import { MessageSchemaType } from "@type/schemas";
import Image from "next/image";
import { useRef, useState } from "react";

const NewRoom = ({ ruser, user }: { ruser: MereUser, user: UserMetaData }) => {

    const [message, setMessage] = useState<MessageSchemaType | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const mutation = useCreateRoomMutation();

    const createRoom = async (data: FormData) => {

        const content = data.get("content")?.toString().trim();
        if (!content || !content.length) return;

        const message: MessageSchemaType = {
            _id: ObjectId().toString(),
            content,
            createdAt: Date.now(),
            username: ruser.username,
            replied_to: undefined,
            replied_content: undefined,
            room: {
                display_name: ruser.username,
                poster: ruser.profile,
                mute: false,
            }
        }

        mutation.mutate({
            message, ruser, user,
            rmid: ObjectId().toString(),
        });

        setMessage(message);

        formRef.current?.reset();
    }

    return (
        <>
            <header className="border-b border-gray40 flex py-4 px-2 items-center gap-4">
                <Navigate comp="button" goto="back"><LeftChevron /></Navigate>
                <Navigate comp="link" goto="info" className="inline">
                    <div className="flex gap-4 items-center">
                        <Image
                            height={48}
                            width={48}
                            alt="Poster of room"
                            className="size-12 object-cover rounded-full"
                            src={getPoster({ path: ruser.profile })} />

                        <h1>{ruser.username}</h1>
                    </div>
                </Navigate>
            </header>
            <section className="p-4 min-h-[25dvh]">
                {
                    message ? (
                        <MessageBar
                            _id=""
                            room_type={"private"}
                            content={message.content}
                            createdAt={message.createdAt}
                            cuid={user.user_id}
                            room_id={""}
                            user_id={user.user_id}
                            username={message.username}
                            status="sent"
                            seenAt={Date.now()}
                        />
                    ) : (
                        <p className="text-center text-zinc-500">Invite this user to chat with you. You can only send 1 message, make it worth.</p>
                    )
                }
            </section>
            <footer className="w-stretch fixed bottom-0 px-2 py-4">
                <form
                    ref={formRef}
                    className="flex items-center gap-2"
                    action={createRoom}>
                    <input
                        placeholder="Send Message"
                        enterKeyHint="send"
                        name="content"
                        maxLength={3000}
                        className="flex-1 border border-invert p-3 bg-transparent rounded-2xl"
                    />
                    <button type="submit" className="size-fit p-2">
                        <SendIcon />
                    </button>
                </form>
            </footer>
        </>
    )

}

export default NewRoom;