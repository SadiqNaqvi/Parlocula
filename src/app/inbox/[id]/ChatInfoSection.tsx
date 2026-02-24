"use client";

import { BellIcon, BellSlashIcon, LinkIcon, RightChevron } from "@assets/Icons";
import { BottomSheet, Navigate, NestedSheet, WarningModal } from "@components";
import { ParloImage } from "@components/ui";
import { hideRoom, leaveRoom, updateNotificationOfRoom } from "@lib/helpers/mutations";
import { useNavigation } from "@store/historystack";
import { FullRoomType } from "@type/internal";
import { PropsWithChildren, useEffect, useRef, useState } from "react";

type Props = { rmid: string, uid: string }

const MuteButton = ({ mute, rmid, uid }: { mute: boolean } & Props) => {

    const [isMute, setIsMute] = useState(mute);
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        return () => {
            if (process.env.NODE_ENV === "development" || isMute === mute) return;
            clearTimeout(timeoutRef.current)
            updateNotificationOfRoom(rmid, uid, isMute);
        }
    });

    const debounceMute = () => {
        clearTimeout(timeoutRef.current);

        const newState = !isMute;

        timeoutRef.current = setTimeout(() => {
            updateNotificationOfRoom(rmid, uid, newState);
        }, 10_000);

        setIsMute(newState);
    }


    if (isMute) return (
        <button onClick={debounceMute} className="p-2 flex flex-col gap-2 flex-1 sm:w-fit border border-gray40 rounded-md">
            <BellSlashIcon />
            <span className="text-sm">Unmute</span>
        </button>
    )

    return (
        <button onClick={debounceMute} className="p-2 flex flex-col gap-2 flex-1 sm:w-fit border border-gray40 rounded-md">
            <BellIcon />
            <span className="text-sm">Mute</span>
        </button>
    )

}

const LeaveRoomButton = ({ rmid, uid }: Props) => {
    const navigation = useNavigation();

    const handleLeave = () => {
        leaveRoom(rmid, uid);
        navigation.replace(`/inbox/${rmid}`);
    }

    return (
        <NestedSheet button="Leave" className="p-2 flex flex-col gap-2 flex-1 sm:w-fit border border-gray40 rounded-md">
            <WarningModal
                action="leave this room"
                dangerButton="Leave"
                dangerFunc={handleLeave}
            />
        </NestedSheet>
    )
}

const HideRoomButton = ({ rmid, uid }: Props) => {
    const navigation = useNavigation();

    const handleHide = () => {
        hideRoom(rmid, uid);
        navigation.replace(`/inbox/${rmid}`);
    }

    return (
        <button onClick={handleHide} className="p-2 flex flex-col gap-2 flex-1 sm:w-fit border border-gray40 rounded-md">
            Hide
        </button>
    )
}

const ActionSection = ({ display_name, mute, type, _id, uid }: Pick<FullRoomType, "mute" | "display_name" | "type" | "_id"> & { uid: string }) => {

    if (type === "private") return (
        <div className="flex gap-3 w-full sm:w-fit">
            <MuteButton rmid={_id} uid={uid} mute={mute} />
            <Navigate
                goto={`/user/${display_name}`}
                comp="link"
                className="p-2 flex flex-col gap-2 flex-1 sm:w-fit border border-gray40 rounded-md">
                <LinkIcon />
                <span className="text-sm"></span>
            </Navigate>
            <HideRoomButton rmid={_id} uid={uid} />
        </div>
    )

    return (
        <div className="flex gap-3 w-full sm:w-fit">
            <MuteButton rmid={_id} uid={uid} mute={mute} />
            <LeaveRoomButton uid={uid} rmid={_id} />
            <HideRoomButton rmid={_id} uid={uid} />
        </div>
    )



}

const ChatInfoSection = ({ room, uid, children }: PropsWithChildren<{ room: FullRoomType, uid: string }>) => {

    return (
        <BottomSheet button={children}>
            <div className="w-full px-2 max-w-screen-md mx-auto space-y-4">
                <section className="flex flex-col flex-cntr-all w-full">
                    <ParloImage
                        frameType="userProfile"
                        className="min-w-12 size-12 object-cover rounded-full"
                        containerClassName="max-h-12 overflow-hidden"
                        frame={room.poster}
                        size={48}
                        alt="Profile Picture of the author of comment"
                    />
                    <h1 className="text-xl">{room.display_name}</h1>
                </section>
                <section>
                    <ActionSection uid={uid} _id={room._id} display_name={room.display_name} mute={room.mute} type={room.type} />
                </section>
                <section>
                    <Navigate
                        comp="link"
                        goto={`${room._id}/participants`}
                        className="p-2 border border-gray30 rounded-md flex flex-cntr-between">
                        <span>Participants</span>
                        <RightChevron />
                    </Navigate>
                </section>
                {room.createdAt && (
                    <section>
                        <p className="text-zinc-500">
                            Created At: {new Date(room.createdAt).toDateString()}
                        </p>
                    </section>
                )}
            </div>
        </BottomSheet>
    )

}

export default ChatInfoSection;