"use client";

import { LeftChevron } from "@assets/Icons";
import { GenericWrapper, Navigate } from "@components";
import { getRoomById } from "@lib/helpers/common";
import { getAblyOnClient } from "@lib/providers/ably";
import { getQueryClient } from "@lib/queryClient";
import { getPoster, getQueryKeys } from "@lib/utils";
import useOfflineStore from "@store/offlineStore";
import { FullRoomType, RequestedUser, RoomEnumType } from "@type/internal";
import Image from "next/image";
import { useEffect } from "react";
import InputBar from "./InputBar";
import MessageList from "./MessageList";
import { useAblyPresence } from "@lib/hooks";

type PresenceProps = {
    uid: string,
    otherParticipant?: string,
    rmid: string
    room_type: RoomEnumType,
}

const PresenceStatus = ({ otherParticipant, uid, rmid, room_type }: PresenceProps) => {

    return room_type === "private" && otherParticipant ? useAblyPresence(uid, otherParticipant, rmid) : ""

}


const ChatSection = ({ rmid, uid, ruid, username }: { rmid: string, uid: string, ruid: string, username: string }) => {

    const queryClient = getQueryClient();
    // const router = useRouter();
    const qkey = getQueryKeys("room_rmid_uid", { rmid, uid })
    const [room, setRoom] = useOfflineStore<FullRoomType | undefined>(qkey, undefined);

    const rUser = queryClient.getQueryData<RequestedUser>(getQueryKeys("user_username", { username }));

    // if (rUser?._id !== ruid) return null;

    const component = (data: FullRoomType | null | undefined) => {

        if (!data) return null;

        return (
            <>
                <header className="sticky top-0 bg-primary border-b border-gray40 flex h-16 px-2 items-center gap-4">
                    <Navigate comp="button" goto="back"><LeftChevron /></Navigate>
                    <Navigate comp="link" goto="info" className="inline">
                        <div className="flex gap-4 items-center">
                            <Image
                                height={36}
                                width={36}
                                alt="Poster of room"
                                className="size-9 object-cover rounded-full"
                                src={getPoster({ path: data?.poster })} />

                            <h1>{data?.display_name || "Unavailable"}</h1>
                        </div>
                        <div>
                            <PresenceStatus
                                otherParticipant={data.otherParticipant_id}
                                uid={uid}
                                rmid={rmid}
                                room_type={data.type}
                            />
                        </div>
                    </Navigate>
                </header>

                <MessageList
                    // participantSeenAt={data && data.type === "private" ? data.otherParticipant_seenAt : undefined}
                    participantSeenAt={data.seenAt}
                    otherParticipantSeenAt={data.otherParticipant_seenAt}
                    invitationMessage={data && data.users.length === 0 ? data.invitationMessage : undefined}
                    rmid={rmid}
                    room_type={data?.type || "private"}
                    uid={uid}
                    participant_type={data?.participantType}
                />

                <InputBar
                    isUnavailable={!rUser}
                    rmid={rmid}
                    ruser={{ _id: ruid, username: rUser?.username || "Unavailable", profile: rUser?.profile }}
                    alreadyInvited={Boolean(data && data.invitationMessage && data.users.length === 1 && data.participantType === "creator")}
                    participant_type={data?.participantType}
                    room={data}
                />
            </>
        )
    }

    return <GenericWrapper
        component={component}
        getQueryProps={() => ({
            args: [uid, rmid],
            queryFn: getRoomById,
            queryKeys: qkey,
            onSuccess: setRoom,
        })}
        props={null}
        placeholderData={room}
        skipNotFound
    />

}

export default ChatSection;