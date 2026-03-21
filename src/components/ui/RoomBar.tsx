import { BellSlashIcon } from "@assets/Icons";
import Navigate from "@components/Navigate";
import { timeAgo } from "@lib/utils";
import useCurrentUser from "@store/user";
import { MereRoomType, SearchedRoom } from "@type/internal";
import ParloImage from "./ParloImage";
import useRoomStore from "@store/roomStore";
import { RoomBarSkeleton } from "./loading";
import OptionalChildren from "./OptionalChildren";

type RoomBarProps = Partial<Omit<MereRoomType, "display_name" | "poster">> & SearchedRoom;

const RoomBar = ({ lastMessageAt, lastMessageBy, mute, otherParticipant_seenAt, display_name, poster, room_id, _id, seenAt, lastMessage, type, }: RoomBarProps) => {

    const { meta } = useCurrentUser();

    const userIslastSender = lastMessageBy && lastMessageBy === meta?.user_id;
    const participantHasSeen = lastMessageAt && otherParticipant_seenAt && new Date(otherParticipant_seenAt) > new Date(lastMessageAt);
    const newMessage = seenAt && lastMessageAt && !userIslastSender && new Date(seenAt) < new Date(lastMessageAt);
    const textToShow = (type === "invitee" || !lastMessage ? "Tap to see" : (userIslastSender ? (participantHasSeen ? "Seen" : "Sent") : lastMessage));

    console.log(userIslastSender, participantHasSeen, newMessage, textToShow);

    return (
        <Navigate
            className="p-2 sm:p-4"
            goto={`/inbox/${room_id || _id}-${display_name}`}
            comp="link">
            <article className="flex gap-3 items-center">
                <ParloImage
                    frameType="userProfile"
                    alt={`Profile picture of ${display_name}`}
                    size={40}
                    frame={poster}
                    containerClassName="rounded-full"
                    className="min-w-10 size-10 object-cover"
                    classNameForFallback="min-w-8 size-8 p-1"
                />

                <div className={`space-y-1 ${newMessage ? "font-semibold" : ""}`}>
                    <h4>{display_name}</h4>
                    <ul className="flex text-xs text-zinc-500 gap-2">
                        <OptionalChildren condition={lastMessageAt}>
                            <li>{timeAgo(lastMessageAt)}</li>
                            <li>•</li>
                        </OptionalChildren>
                        <li className="line-clamp-1">{textToShow}</li>
                    </ul>
                </div>
                {mute && (
                    <div><BellSlashIcon className="size-2" /></div>
                )}
            </article>
        </Navigate>
    )
}

export const RichRoomBar = ({ room_id }: { room_id: string }) => {
    const { room, isFilled } = useRoomStore();
    const roomData = room[room_id];

    if (!isFilled && !roomData) return (
        <RoomBarSkeleton />
    )

    else if (!roomData) return;

    return (
        <RoomBar {...roomData} _id={room_id} />
    )

}

export default RoomBar;