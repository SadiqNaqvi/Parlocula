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
    const correctStatus = status === "sent" ?
        checkIfMessageSeen(createdAt, otherParticipantSeenAt) ? "seen" : "sent"
        : status

    const handleContextMenu: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onMessageSelect?.({ ...message, status: correctStatus });
    }

    return (
        <li
            key={_id}
            className={`w-full flex flex-col ${currentAuthor ? "items-end" : "items-start"} ${sameAuthor ? "mt-1" : "mt-3"}`}
            id={_id}
        >

            {Boolean(!sameAuthor && room_type === "group") && (
                <p className="mb-2">{currentAuthor ? "You" : username}</p>
            )}
            <div
                className={`w-fit max-w-[50%] border border-gray80 rounded-xl`}
            // ${sameAuthor ? "" : currentAuthor ? "rounded-br-none" : "rounded-bl-none"}
            >
                <OptionalChildren condition={replied_content && replied_to}>
                    <Link href={`#${replied_to}`} className="no-underline">
                        <div className="p-2 line-clamp-2 rounded-md text-sm mb-2 bg-gray20 border border-gray20">
                            {replied_content}
                        </div>
                    </Link>
                </OptionalChildren>

                <button
                    className="flex-col p-2 space-y-1"
                    onContextMenu={handleContextMenu}
                >
                    <p className="max-w-full">{content}</p>
                    <p className="text-right text-xs text-zinc-500">{correctStatus}</p>
                </button>

            </div>
        </li>
    )
}

export default MessageBar;