import { GenericDate, MereMessage, RoomEnumType } from "@type/internal";
import Link from "next/link";
import { MouseEventHandler } from "react";
import OptionalChildren from "./OptionalChildren";

type MessageParam = MereMessage & {
    prevMsgUid?: string,
    cuid: string,
    seenAt: GenericDate,
    otherParticipantSeenAt?: GenericDate,
    room_type: RoomEnumType,
    onMessageSelect?: (p: any) => void
}

const checkIfMessageSeen = (createdAt: GenericDate, otherParticipantSeenAt: GenericDate | undefined) =>
    Boolean(otherParticipantSeenAt && new Date(otherParticipantSeenAt).getTime() > new Date(createdAt).getTime())

const MessageBar = ({ prevMsgUid, otherParticipantSeenAt, cuid, room_type, onMessageSelect, ...message }: MessageParam) => {

    const { _id, content, user_id, username, replied_content, status, createdAt, replied_to } = message;
    const sameAuthor = user_id === prevMsgUid;
    const currentAuthor = user_id === cuid;
    const hasSeen = currentAuthor ? checkIfMessageSeen(createdAt, otherParticipantSeenAt) : false;
    const correctStatus = !currentAuthor ? undefined : status === "sent" ? hasSeen ? "seen" : "sent" : status;
    const statusForBottomSheet = currentAuthor ? correctStatus || hasSeen ? "seen" : "sent" : undefined;

    const handleContextMenu: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onMessageSelect?.({ ...message, status: statusForBottomSheet });
    }

    return (
        <li
            key={_id}
            className={`w-full flex flex-col ${currentAuthor ? "items-end" : "items-start"} ${sameAuthor && !replied_to ? "mt-1" : "mt-3"}`}
            id={_id}
        >
            <OptionalChildren condition={!sameAuthor || room_type === "group"}>
                <p className="mb-1 text-sm">{currentAuthor ? "You" : username}</p>
            </OptionalChildren>
            <div>
                <OptionalChildren condition={replied_content && replied_to}>
                    <Link href={`#${replied_to}`} className="no-underline">
                        <div className="p-2 line-clamp-2 rounded-md rounded-b-none w-fit ml-auto text-sm border border-b-0 border-gray20">
                            {replied_content}
                        </div>
                    </Link>
                </OptionalChildren>

                <button
                    className={`${currentAuthor ? "rounded-br-none" : "rounded-bl-none"} border border-gray10 bg-gray10 rounded-md p-2`}
                    onContextMenu={handleContextMenu}
                >
                    {content}
                </button>
            </div>
            <p className="text-right text-xs text-zinc-500">{correctStatus}</p>
        </li>
    )
}

export default MessageBar;