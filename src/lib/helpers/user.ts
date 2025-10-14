import { oneHour } from "@lib/constants";
import { getAblyOnClient } from "@lib/providers/ably";
import useNotification from "@store/notification";
import useCurrentUser from "@store/user";
import { User } from "@type/internal";
import { AblyEventParams } from "@type/other";
import toast from "react-hot-toast";
import { pushMessageIntoList, setOrRemoveRoom } from "./room/client";
import { ConnectionStateChange } from "ably";

const setUser = (user: User) => {
    const setUserHash = useCurrentUser.getState().setUserHash;
    const setMeta = useCurrentUser.getState().setUserMeta;
    setMeta({ user_id: user._id, username: user.username });
    setUserHash(user);
}

export const setUserOnRefreshOrLogin = (user: User) => {

    setUser(user);

    const ably = getAblyOnClient(user._id)
    const channel = ably.channels.get(user._id);
    channel.presence.enter({ status: "online" });

    const handleConnectionStateChange = (stateChange: ConnectionStateChange) => {
        console.log("Connection state:", stateChange.current);
        if (stateChange.current === 'connected') {
            channel.presence.enter({ status: 'online' });
        }
    };

    ably.connection.on(handleConnectionStateChange);

    const handleNewNotification = ({ data }: { data?: AblyEventParams["notification"] }) => {
        if (!data) return;
        console.log("Notification received", data);
        toast.success("New Notification has arrived.", { icon: "🔔" });
        useNotification.setState({ newNotification: true }, true);
    }

    const handleMessageArrival = ({ data }: { data?: AblyEventParams["message"] }) => {
        if (!data || data.user_id === user._id) return;

        const { room_id, room } = data;

        pushMessageIntoList({
            message: data,
            rmid: room_id.toString(),
            uid: user._id,
            room: {
                display_name: room.display_name,
                poster: room.poster,
                lastMessage: data.content,
                lastMessageAt: data.createdAt,
                lastMessageBy: data.user_id,
                otherParticipant_id: data.user_id,
                otherParticipant_seenAt: data.createdAt,
                room_id,
                type: "participant",
                seenAt: Date.now() - oneHour,
                mute: room.mute,
            }
        });

        ably.channels.get(data.user_id).publish("entered_chat", {
            room_id,
            time: Date.now(),
            user_id: user._id,
        } as AblyEventParams["entered_chat"]);

        if (window && !window.location.href.includes(`inbox/${room_id}`)) {
            toast.success(`New message arrived from ${room.display_name}`);
        }
    }

    const handleEnterChat = ({ data }: { data?: AblyEventParams["entered_chat"] }) => {
        console.log("Entered chat", data);
        if (!data || data.user_id === user._id) return;

        setOrRemoveRoom({
            rmid: data.room_id,
            uid: user._id,
            update: true,
            room: { otherParticipant_seenAt: data.time }
        });
    }

    const handleVisibility = () => {
        if (document.visibilityState === "hidden") {
            channel.presence.leave({ status: "offline" });
        } else {
            channel.presence.enter({ status: "online" });
        }
    }

    document?.addEventListener("visibilitychange", handleVisibility)

    channel.subscribe("notification", handleNewNotification);

    channel.subscribe("message", handleMessageArrival);

    channel.subscribe("entered_chat", handleEnterChat);

    return () => {
        document?.removeEventListener("visibilitychange", handleVisibility)
        channel.unsubscribe("notification", handleNewNotification);
        channel.unsubscribe("message", handleMessageArrival);
        channel.presence.leave();
        ably.connection.off(handleConnectionStateChange);
    }
}

/*

1. in /new, fix thread choice chooser and use useOfflineStore hook.
2. Check joined thread and thread memebers aggregation
3. 

*/