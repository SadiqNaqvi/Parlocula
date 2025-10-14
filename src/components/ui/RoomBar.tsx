import { BellSlashIcon } from "@assets/Icons";
import Navigate from "@components/Navigate";
import { getPoster, timeAgo } from "@lib/utils";
import useCurrentUser from "@store/user";
import { MereRoomType } from "@type/internal";
import Image from "next/image";

const RoomBar = ({ lastMessageAt, lastMessageBy, mute, otherParticipant_seenAt, display_name, poster, room_id, seenAt, lastMessage, type, }: MereRoomType) => {

    const { meta } = useCurrentUser();

    const userIslastSender = lastMessageBy && lastMessageBy === meta?.user_id;
    const participantHasSeen = lastMessageAt && otherParticipant_seenAt && new Date(otherParticipant_seenAt) > new Date(lastMessageAt);
    const newMessage = seenAt && lastMessageAt && !userIslastSender && new Date(seenAt) < new Date(lastMessageAt);
    const textToShow = (type === "invitee" || !lastMessage ? "Tap to see" : (userIslastSender ? (participantHasSeen ? "Seen" : "Sent") : lastMessage));

    return (
        <Navigate
            className="p-2 sm:p-4"
            goto={`/inbox/${room_id}-${display_name}`}
            comp="link">
            <article className="flex gap-3 items-center">
                <div>
                    <Image
                        alt={`Profile picture of ${display_name}`}
                        width={40}
                        height={40}
                        src={getPoster({ path: poster })}
                        className="size-10 rounded-full object-cover"
                    />
                </div>
                <div className={`space-y-1 ${newMessage ? "font-semibold" : ""}`}>
                    <h4>{display_name}</h4>
                    <ul className="flex text-xs text-zinc-500 gap-2">
                        {lastMessageAt && <li>{timeAgo(lastMessageAt)}</li>}
                        <li>•</li>
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

export default RoomBar;