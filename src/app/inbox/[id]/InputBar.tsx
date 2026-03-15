"use client";

import { SendIcon, XmarkIcon } from "@assets/Icons";
import { OptionalChildren } from "@components/ui";
import { acceptRoomInvitation, rejectRoomInvitation, sendMessage } from "@lib/helpers/mutations";
import { getAblyOnClient } from "@lib/providers/ably";
import { parloId } from "@lib/utils";
import useGlobalStore from "@store/globalStore";
import useCurrentUser from "@store/user";
import { FullRoomType, MessageReplyType } from "@type/internal";
import { MessageSchemaType } from "@type/schemas";
import { RealtimeChannel } from "ably";
import { PropsWithChildren, useEffect, useRef } from "react";

type Props = {
    rmid: string,
    uid: string,
    room: FullRoomType;
}

const FooterWrapper = ({ children }: PropsWithChildren) => (
    <footer className="w-stretch fixed bottom-0 px-2 py-4 bg-primary">
        {children}
    </footer>
);

const InputBar = ({ rmid, room }: Props) => {

    const [reply, setReply] = useGlobalStore<MessageReplyType | undefined>(`reply-${rmid}`, undefined);
    const { meta } = useCurrentUser();

    const formRef = useRef<HTMLFormElement>(null);
    const typingIndicatorInterval = useRef<NodeJS.Timeout>(null);
    const channel = useRef<RealtimeChannel>(null);

    const isRoomPending = Boolean(room.participant_count === 1 && room.participantType === "creator");

    useEffect(() => {
        if (!meta) return;
        channel.current = getAblyOnClient(meta.user_id).channels.get(meta.user_id)
    }, [meta]);

    if (!meta) return null;

    const acceptRoom = () => {
        acceptRoomInvitation(rmid, uid, room);
    }

    const rejectRoom = () => {
        rejectRoomInvitation(rmid, uid);
    }

    const uid = meta.user_id;

    if (room.participantType === "invitee") return (
        <FooterWrapper>
            <div className="flex flex-cntr-all gap-4">
                <button className="flex-1 sm:max-w-fit primary" onClick={acceptRoom}>Accept</button>
                <button className="flex-1 sm:max-w-fit secondary" onClick={rejectRoom}>Reject</button>
            </div>
        </FooterWrapper>
    )

    else if (isRoomPending) return (
        <FooterWrapper>
            <p className="text-sm text-center text-zinc-500">You need to wait till the user accepts your invitation.</p>
        </FooterWrapper>
    )

    const send = async (data: FormData) => {
        if (isRoomPending) return;

        const content = data.get("content")?.toString().trim();
        if (!content || !content.length) return;

        const message: MessageSchemaType = {
            _id: parloId(),
            content,
            createdAt: Date.now(),
            username: meta.username,
            replied_to: room ? reply?.replied_to : undefined,
            replied_content: room ? reply?.replied_content : undefined,
            room: {
                display_name: room.type === "private" ? meta.username : room.display_name,
                poster: room.type === "private" ? meta.profile : room.poster,
                mute: room.mute,
            }
        }

        reply && setReply(undefined);
        sendMessage(rmid, uid, message);

        formRef.current?.reset();
        window.scrollTo(0, window.outerHeight);
    }

    const indicateTyping = async () => {
        if (!typingIndicatorInterval.current) {
            console.log("Started typing");
            channel.current?.presence.update({ status: "started_typing", room_id: rmid })
        }
        else
            clearTimeout(typingIndicatorInterval.current);

        typingIndicatorInterval.current = setTimeout(() => {
            console.log("Stopped Typing");
            channel.current?.presence.update({ status: "stopped_typing", room_id: rmid })
            typingIndicatorInterval.current = null;
        }, 5000);

    }

    return (
        <FooterWrapper>

            <OptionalChildren condition={reply}>
                <div className="py-2 px-2 flex gap-2 flex-cntr-between border-t border-gray40">
                    <p className="line-clamp-2">{reply?.replied_content}</p>
                    <button className="p-2 bg-gray20 rounded-full" onClick={() => setReply(undefined)}>
                        <XmarkIcon className="size-2" />
                    </button>
                </div>
            </OptionalChildren>

            <form
                ref={formRef}
                className="flex items-center gap-2"
                action={send}>
                <input
                    placeholder="Send Message"
                    enterKeyHint="send"
                    name="content"
                    onChangeCapture={indicateTyping}
                    maxLength={3000}
                    className="flex-1 border border-invert p-3 bg-transparent rounded-2xl"
                />
                <button type="submit" className="size-fit p-2">
                    <SendIcon />
                </button>
            </form>
        </FooterWrapper>
    )

}

export default InputBar;