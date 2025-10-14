"use client";

import { convertFullToMereRoom, useAcceptInviteMutation, useCreateRoomMutation, usePostMessageInRoom, useRejectInviteMutation } from "@/lib/helpers/room/client";
import { SendIcon, XmarkIcon } from "@assets/Icons";
import { getAblyOnClient } from "@lib/providers/ably";
import { ObjectId } from "@lib/utils";
import useGlobalState from "@store/globalStore";
import useCurrentUser from "@store/user";
import { FullRoomType, MereUser, MessageReplyType, ParticipantEnumType } from "@type/internal";
import { MessageSchemaType } from "@type/schemas";
import { RealtimeChannel } from "ably";
import { PropsWithChildren, useEffect, useRef } from "react";

type Props = {
    rmid: string,
    ruser: MereUser,
    isUnavailable: boolean | undefined;
    alreadyInvited: boolean | undefined;
    participant_type: ParticipantEnumType | undefined;
    room: FullRoomType;
}

const FooterWrapper = ({ children }: PropsWithChildren) => (
    <footer className="w-stretch fixed bottom-0 px-2 py-4 bg-primary">{children}</footer>
);

const InputBar = ({ rmid, isUnavailable, alreadyInvited, room, participant_type, ruser }: Props) => {

    const [reply, setReply] = useGlobalState<MessageReplyType | undefined>(`reply-${rmid}`, undefined);
    const { meta, user } = useCurrentUser();
    const formRef = useRef<HTMLFormElement>(null);
    const typingIndicatorInterval = useRef<NodeJS.Timeout>();
    const channel = useRef<RealtimeChannel>();

    const acceptInvite = useAcceptInviteMutation();
    const rejectInvite = useRejectInviteMutation();
    const createRoom = useCreateRoomMutation();
    const postMessage = usePostMessageInRoom();

    useEffect(() => {
        if (!meta) return;
        channel.current = getAblyOnClient(meta.user_id).channels.get(meta.user_id)
    }, [meta])

    if (!meta || !user) return null;

    const ably = getAblyOnClient(meta.user_id);

    if (isUnavailable) return (
        <FooterWrapper>
            <p className="text-sm text-center text-zinc-500">This account is unavailable at the moment.</p>
        </FooterWrapper>
    )

    else if (room && participant_type === "invitee") return (
        <FooterWrapper>
            <div className="flex flex-cntr-all gap-4">
                <button className="flex-1 sm:max-w-fit primary" onClick={() => acceptInvite.mutate({ rmid, uid: meta.user_id, room })} >Accept</button>
                <button className="flex-1 sm:max-w-fit secondary" onClick={() => rejectInvite.mutate({ rmid, uid: meta.user_id })} >Reject</button>
            </div>
        </FooterWrapper>
    )

    else if (alreadyInvited && participant_type === "creator") return (
        <FooterWrapper>
            <p className="text-sm text-center text-zinc-500">You need to wait till the user accepts your invitation.</p>
        </FooterWrapper>
    )

    const sendMessage = async (data: FormData) => {
        if (alreadyInvited || isUnavailable) return;

        const content = data.get("content")?.toString().trim();
        if (!content || !content.length) return;

        const message: MessageSchemaType = {
            _id: ObjectId().toString(),
            content,
            createdAt: Date.now(),
            username: meta.username,
            replied_to: room ? reply?.replied_to : undefined,
            replied_content: room ? reply?.replied_content : undefined,
            room: {
                display_name: room.type === "private" ? user.username : room.display_name,
                poster: room.type === "private" ? user.profile : room.poster,
                mute: room.mute,
            }
        }

        if (!room) createRoom.mutate({ rmid, ruser, user: meta, message });

        else {
            reply && setReply(undefined);
            postMessage.mutate({
                message,
                rmid,
                uid: meta.user_id,
                room: convertFullToMereRoom(room),
            });
        }
        formRef.current?.reset();
        window.scrollTo(0, window.outerHeight);
    }

    const indicateTyping = async () => {
        console.log("Typing indicator me AAYA")
        if (!typingIndicatorInterval.current) {
            console.log("Started typing");
            channel.current?.presence.update({ status: "started_typing", room_id: rmid })
        }
        else
            clearTimeout(typingIndicatorInterval.current);

        typingIndicatorInterval.current = setTimeout(() => {
            console.log("Stopped Typing");
            channel.current?.presence.update({ status: "stopped_typing", room_id: rmid })
            typingIndicatorInterval.current = undefined;
        }, 5000);

    }

    return (
        <FooterWrapper>

            {reply && (
                <div className="py-2 px-2 flex gap-2 flex-cntr-between border-t border-gray40">
                    <p className="line-clamp-2">{reply.replied_content}</p>
                    <button className="p-2 bg-gray20 rounded-full" onClick={() => setReply(undefined)}>
                        <XmarkIcon className="size-2" />
                    </button>
                </div>
            )}

            <form
                ref={formRef}
                className="flex items-center gap-2"
                action={sendMessage}>
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