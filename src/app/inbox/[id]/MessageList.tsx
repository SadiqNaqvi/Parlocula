"use client";

import { BottomSheet } from "@components/BottomSheet";
import { MessageBar, ShowError } from "@components/ui";
import MessageSkeleton from "@components/ui/loading/MessageSkeleton";
import { getMessages } from "@lib/helpers/common";
import { updateDoc, updateParticipantSeenAt } from "@lib/helpers/mutations";
import { useInfiniteQueryHook } from "@lib/hooks";
import { getQueryKeys } from "@lib/utils";
import useOfflineStore from "@store/offlineStore";
import { FullRoomType, InfiniteQueryResponse, MereMessage } from "@type/internal";
import { ErrorCodes } from "@type/other";
import React, { useEffect, useRef, useState } from "react";
import MessageBottomSheet from "./MessageBottomSheet";

const MessageList = ({ uid, room }: { uid: string, room: FullRoomType }) => {

    const { participantType, type, invitationMessage, seenAt, otherParticipant_seenAt, participant_count } = room;
    const rmid = room._id;

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

    useEffect(() => {
        if (participantType === "invitee" || !data || !data.pages.length || !data.pages[0]?.results?.length) return;

        else if (type === "group") {
            updateDoc(
                getQueryKeys("room_rmid_uid", { rmid, uid }),
                { seenAt: Date.now() }
            );
        }

        else updateParticipantSeenAt(rmid, uid);

        const current = container.current
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !isFetchingNextPage && hasNextPage)
                fetchNextPage();
        }, { threshold: 0.1 })

        if (current) observer.observe(current);

        return () => {
            if (current) observer.unobserve(current);
        }

    }, []);

    useEffect(() => { console.log("selectedMessage", selectedMessage) }, [selectedMessage]);

    const container = useRef<HTMLDivElement>(null);

    if (isLoading) return <MessageSkeleton />

    else if (error) return (
        <ShowError
            heading="Something went wrong"
            errCode={error.message as ErrorCodes}
            retry={refetch}
        />
    )

    else if (invitationMessage && (participantType === "invitee" || participant_count < 2)) return (
        <section className="mt-4 px-2">
            <MessageBar
                _id=""
                room_type={type}
                content={invitationMessage.content}
                createdAt={invitationMessage.createdAt}
                cuid={uid}
                room_id={rmid}
                user_id={invitationMessage.user_id}
                username={invitationMessage.username}
                seenAt={seenAt}
                status="sent"
            />
        </section>
    )

    else if (!data || !data.pages[0]?.results?.length) return null;

    const handleMessageSelection = (message: any) => {
        setSelectedMessage(message);
    }

    const closeSheet = () => setSelectedMessage(undefined)

    return (
        <section className="h-size-screen overflow-y-auto pb-22">
            <ul className="w-full px-2">
                {data.pages.map((page, i) => (
                    <React.Fragment key={i}>
                        {page.results.map((msg, ind) => (
                            <MessageBar
                                {...msg}
                                otherParticipantSeenAt={otherParticipant_seenAt}
                                room_type={type}
                                key={msg._id}
                                prevMsgUid={page.results[ind - 1]?.user_id}
                                cuid={uid}
                                seenAt={seenAt}
                                onMessageSelect={handleMessageSelection}
                            />
                        ))}
                    </React.Fragment>
                ))}
            </ul>

            <div className="my-4 mx-auto" ref={container}>
                {isFetchingNextPage && (
                    <MessageSkeleton />
                )}
            </div>

            <BottomSheet
                state={!!selectedMessage}
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