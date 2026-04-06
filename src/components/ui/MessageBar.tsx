import { GenericDate, MereMessage, RoomEnumType } from "@type/internal";
import Link from "next/link";
import { MouseEventHandler } from "react";
import OptionalChildren from "./OptionalChildren";
import { twMerge } from "tailwind-merge";
import useGlobalStore from "@store/globalStore";
import Navigate from "@components/Navigate";

type MessageParam = MereMessage & {
    nextMsgAuthor?: string,
    prevMsgAuthor?: string,
    cuid: string,
    seenAt: GenericDate,
    otherParticipantSeenAt?: GenericDate,
    room_type: RoomEnumType
}

const checkIfMessageSeen = (createdAt: GenericDate, otherParticipantSeenAt: GenericDate | undefined) =>
    Boolean(otherParticipantSeenAt && new Date(otherParticipantSeenAt).getTime() > new Date(createdAt).getTime())

const MessageBar = ({ nextMsgAuthor, prevMsgAuthor, otherParticipantSeenAt, cuid, room_type, ...message }: MessageParam) => {

    const [_, setSelectedMessage] = useGlobalStore<MereMessage>("selectedMessage");

    const { _id, content, user_id, username, replied_content, status, createdAt, replied_to } = message;
    const sameAuthorForNext = user_id === nextMsgAuthor;
    const sameAuthorForPrev = user_id === prevMsgAuthor;
    const currentAuthor = user_id === cuid;
    const hasSeen = currentAuthor ? checkIfMessageSeen(createdAt, otherParticipantSeenAt) : false;
    const correctStatus = !currentAuthor ? undefined : status === "sent" ? hasSeen ? "seen" : "sent" : status;
    const statusForBottomSheet = currentAuthor ? correctStatus ?? (hasSeen ? "seen" : "sent") : undefined;

    const handleContextMenu: MouseEventHandler<HTMLButtonElement> = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedMessage({ ...message, status: statusForBottomSheet });
    }

    return (
        <li
            key={_id}
            className={`w-full flex flex-col ${currentAuthor ? "items-end" : "items-start"} ${sameAuthorForNext ? "mb-1" : "mb-3"} ${replied_to ? "mt-2" : ""}`}
            id={_id}
        >
            <OptionalChildren condition={prevMsgAuthor !== user_id && room_type === "group"}>
                <p className="mb-1 text-sm">{currentAuthor ? "You" : username}</p>
            </OptionalChildren>
            <div>
                <OptionalChildren condition={replied_content && replied_to}>
                    <Link href={`#${replied_to}`} className="no-underline">
                        <div className={`${currentAuthor ? "ml-auto" : "mr-auto"} p-2 line-clamp-2 rounded-md rounded-b-none w-fit text-sm border border-b-0 border-gray20`}>
                            {replied_content}
                        </div>
                    </Link>
                </OptionalChildren>

                <button
                    className={twMerge(
                        "rounded-md border border-gray10 bg-gray10 p-2",
                        sameAuthorForPrev || replied_to ? currentAuthor ? "rounded-tr-none" : "rounded-tl-none" : undefined,
                        sameAuthorForNext ? currentAuthor ? "rounded-br-none" : "rounded-bl-none" : undefined,
                    )}
                    onContextMenu={handleContextMenu}
                >
                    <OptionalChildren condition={message.sharedContent} fallback={content}>
                        <Navigate comp="link" goto={message.sharedContent!} className="text-sky-500">
                            {content || "Open Attached Content"}
                        </Navigate>
                    </OptionalChildren>
                </button>
            </div>

            <OptionalChildren condition={currentAuthor}>
                <p className={`text-right text-xs ${correctStatus === "error" ? "text-red-500" : "text-zinc-500"}`}>{correctStatus}</p>
            </OptionalChildren>
        </li>
    )
}

export default MessageBar;