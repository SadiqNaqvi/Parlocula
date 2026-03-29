import { BellSlashIcon } from "@assets/Icons";
import Navigate from "@components/Navigate";
import { timeAgo } from "@lib/utils";
import useRoomStore from "@store/roomStore";
import useCurrentUser from "@store/user";
import { MereRoomType } from "@type/internal";
import { RoomBarSkeleton } from "./loading";
import OptionalChildren from "./OptionalChildren";
import ParloImage from "./ParloImage";
import useGlobalStore from "@store/globalStore";
import MetadataTile, { MetadataTileContainer } from "./MetaDataTile";

const RoomBar = ({ lastMessageAt, lastMessageBy, mute, otherParticipant_seenAt, display_name, poster, room_id, _id, seenAt, lastMessage, type, status }: Partial<MereRoomType> & { _id: string }) => {

    const { meta } = useCurrentUser();
    const [_, setSelectedRoomId] = useGlobalStore<string>("roombarSheet", undefined);

    const userIslastSender = lastMessageBy && lastMessageBy === meta?.user_id;
    const participantHasSeen = lastMessageAt && otherParticipant_seenAt && new Date(otherParticipant_seenAt) > new Date(lastMessageAt);
    const newMessage = seenAt && lastMessageAt && !userIslastSender && new Date(seenAt) < new Date(lastMessageAt);
    const textToShow = status || (type === "invitee" || !lastMessage ? "Tap to see" : (userIslastSender ? (participantHasSeen ? "Seen" : "Sent") : lastMessage));

    const handleContextMenu = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedRoomId(room_id || _id);
    }

    return (
        <Navigate
            onContextMenu={handleContextMenu}
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

                <div className={`flex-1 ${newMessage ? "font-semibold" : ""}`}>

                    <h4>{display_name}</h4>

                    <OptionalChildren
                        condition={status !== "error"}
                        fallback={<p className="text-red-500 text-xs">Failed To Send</p>}
                    >
                        <MetadataTileContainer className="text-zinc-500 max-w-[60%]">
                            <MetadataTile condition={!!lastMessageAt} className="whitespace-nowrap text-xs">{timeAgo(lastMessageAt)}</MetadataTile>
                            <MetadataTile condition={!!textToShow} className="line-clamp-1 text-wrap text-xs">{textToShow}</MetadataTile>
                        </MetadataTileContainer>
                    </OptionalChildren>
                </div>
                <OptionalChildren condition={mute}>
                    <div className="ml-auto">
                        <BellSlashIcon />
                    </div>
                </OptionalChildren>
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