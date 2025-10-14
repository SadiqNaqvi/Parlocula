"use client";

import { BottomSheet } from "@components/BottomSheet";
import { ShowError } from "@components/ui";
import MessageBar from "@components/ui/MessageBar";
import { getMessages } from "@lib/helpers/common";
import { setOrRemoveRoom, useParticipantSeenUpdate } from "@lib/helpers/room/client";
import { useInfiniteQueryHook } from "@lib/hooks";
import { getQueryKeys } from "@lib/utils";
import useOfflineStore from "@store/offlineStore";
import { GenericDate, InfiniteQueryResponse, InvitationMessageType, MereMessage, ParticipantEnumType, RoomEnumType } from "@type/internal";
import React, { useEffect, useRef, useState } from "react";
import MessageBottomSheet from "./MessageBottomSheet";
import { getAblyOnClient } from "@lib/providers/ably";

const MessageLoading = () => (
    <div className="w-full flex flex-col px-2">
        {Array(4).fill(0).map((_, ind) => (
            <section key={ind} className={`my-3 w-1/2 space-y-1 ${ind % 2 === 0 ? "self-end flex flex-col items-end" : ''}`}>
                <>
                    {Array(3).fill(0).map((_, i) => (
                        <div
                            style={{ width: `${30 * (i + 1)}%` }}
                            className="animate-pulse h-2 bg-gray40 rounded-md"
                            key={i}>
                        </div>
                    ))}
                </>
            </section>
        ))}
    </div>
)

type Props = {
    rmid: string,
    uid: string,
    participantSeenAt: GenericDate,
    participant_type: ParticipantEnumType,
    otherParticipantSeenAt: GenericDate | undefined,
    invitationMessage: InvitationMessageType | undefined,
    room_type: RoomEnumType,
}

const MessageList = ({ rmid, uid, participantSeenAt, otherParticipantSeenAt, participant_type, invitationMessage, room_type }: Props) => {

    const qKeys = getQueryKeys("messages_rmid", { rmid });
    const [messageList, setMessageList] = useOfflineStore<InfiniteQueryResponse<MereMessage> | undefined>(qKeys, undefined);
    const [selectedMessage, setSelectedMessage] = useState();

    const { data, refetch, isLoading, error, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteQueryHook<MereMessage>({
        queryKeys: qKeys,
        queryFn: (p) => getMessages(uid, rmid, p),
        placeholderData: messageList,
        onSuccess: (data) => {
            const [first] = data.pages;
            if (first.page === 1) setMessageList(first);
        }
    });

    const mutation = useParticipantSeenUpdate();

    useEffect(() => {
        if (participant_type === "invitee" || !data || !data.pages.length || !data.pages[0]?.results?.length) return;
        if (room_type === "group")
            setOrRemoveRoom({ rmid, uid, update: true, room: { seenAt: Date.now() } });
        else mutation.mutate({ rmid, uid });
    }, []);

    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !isFetchingNextPage && hasNextPage)
                fetchNextPage();
        }, { threshold: 0.1 })

        if (container.current)
            observer.observe(container.current);

        return () => {
            if (container.current)
                observer.unobserve(container.current);
        }
    }, [container.current]);

    if (isLoading) return <MessageLoading />

    else if (error) return (
        <ShowError
            heading="Something went wrong"
            errCode={error.message}
            retry={refetch}
        />
    )

    if (invitationMessage) return (
        <section className="mt-4 px-2">
            <MessageBar
                _id=""
                room_type={room_type}
                content={invitationMessage.content}
                createdAt={invitationMessage.createdAt}
                cuid={uid}
                room_id={rmid}
                user_id={invitationMessage.user_id}
                username={invitationMessage.username}
                seenAt={participantSeenAt}
                status="sent"
            />
        </section>
    )

    if (!data || !data.pages[0]?.results?.length) return null;

    const handleMessageSelection = (message: any) => {
        setSelectedMessage(message);
    }

    const closeSheet = () => setSelectedMessage(undefined)

    return (
        <section className="pb-16 px-2">
            <ul className="w-full">
                {data.pages.map((page, i) => (
                    <React.Fragment key={i}>
                        {page.results.map((msg, ind) => (
                            <MessageBar
                                {...msg}
                                otherParticipantSeenAt={otherParticipantSeenAt}
                                room_type={room_type}
                                key={msg._id}
                                prevMsgUid={page.results[ind - 1]?.user_id}
                                cuid={uid}
                                seenAt={participantSeenAt}
                                onMessageSelect={handleMessageSelection}
                            />
                        ))}
                    </React.Fragment>
                ))}
            </ul>

            <div className="mt-4 mx-auto" ref={container}>
                {isFetchingNextPage && (
                    <MessageLoading />
                )}
            </div>

            <BottomSheet
                state={Boolean(selectedMessage)}
                onClose={closeSheet}
                allowHandle
            >
                <MessageBottomSheet
                    message={selectedMessage}
                    uid={uid}
                    close={closeSheet}
                />
            </BottomSheet>
        </section>
    )

}

export default MessageList;