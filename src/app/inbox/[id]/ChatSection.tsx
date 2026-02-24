"use client";

import { LeftChevron } from "@assets/Icons";
import { GenericWrapper, Navigate } from "@components";
import { ParloImage } from "@components/ui";
import { getRoomById } from "@lib/helpers/common";
import { useAblyPresence } from "@lib/hooks";
import { getQueryKeys } from "@lib/utils";
import useOfflineStore from "@store/offlineStore";
import { FullRoomType, RoomEnumType } from "@type/internal";
import ChatInfoSection from "./ChatInfoSection";
import InputBar from "./InputBar";
import MessageList from "./MessageList";

type PresenceProps = {
    uid: string,
    otherParticipant?: string,
    rmid: string
    room_type: RoomEnumType,
}

const PresenceStatus = ({ otherParticipant, uid, rmid, room_type }: PresenceProps) => {

    const presence = useAblyPresence(uid, otherParticipant, rmid);

    return room_type === "private" && otherParticipant ? presence : ""

}

type Props = { rmid: string, uid: string }

const Component = (data: FullRoomType, { rmid, uid }: Props) => {

    return (
        <>
            <header className="sticky top-0 bg-primary border-b border-gray40 flex h-16 px-2 items-center gap-4">
                <Navigate comp="button" goto="back">
                    <LeftChevron />
                </Navigate>
                <ChatInfoSection room={data} uid={uid}>
                    <div className="flex gap-4 items-center">
                        <ParloImage
                            frameType="userProfile"
                            className="min-w-12 size-12 object-cover rounded-full"
                            containerClassName="max-h-12 overflow-hidden"
                            frame={data.poster}
                            size={48}
                            alt="Poster of room"
                        />

                        <h1>{data.display_name || "Unavailable"}</h1>
                    </div>
                    <div>
                        <PresenceStatus
                            otherParticipant={data.otherParticipant_id}
                            uid={uid}
                            rmid={rmid}
                            room_type={data.type}
                        />
                    </div>
                </ChatInfoSection>
            </header>

            <MessageList room={data} uid={uid} />

            <InputBar rmid={rmid} room={data} uid={uid} />
        </>
    )
}

const ChatSection = ({ rmid, uid }: Props) => {

    const qkey = getQueryKeys("room_rmid_uid", { rmid, uid })
    const [room, setRoom] = useOfflineStore<FullRoomType | undefined>(qkey, undefined);


    return <GenericWrapper
        component={Component}
        getQueryProps={() => ({
            args: [uid, rmid],
            queryFn: getRoomById,
            queryKeys: qkey,
            onSuccess: setRoom,
        })}
        props={{ rmid, uid }}
        placeholderData={room}
        needUser
    />

}

export default ChatSection;