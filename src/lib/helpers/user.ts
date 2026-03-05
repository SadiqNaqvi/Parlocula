import { getAblyOnClient } from "@lib/providers/ably";
import { getQueryKeys } from "@lib/utils";
import useNotification from "@store/notification";
import useCurrentUser from "@store/user";
import { MereRoomType, CurrentUser } from "@type/internal";
import { AblyEventParams } from "@type/other";
import { ConnectionStateChange } from "ably";
import { toast } from "sonner";
import { refetchQueries, showMessageOptimistically, updateDoc, updateDocInInfiniteQueryResult } from "./mutations";

const setUser = (user: CurrentUser, contentFiltering: boolean) => {

    console.log("USER IN SETUSER FUNC IN LIB/HELPERS/USER", user);
    if (!user) return;
    const { setUser, setUserMeta, setContentFiltering } = useCurrentUser.getState();
    setContentFiltering(contentFiltering);
    setUserMeta({ user_id: user._id, username: user.username, profile: user.profile });
    setUser(user);
}

export const setUserOnRefreshOrLogin = (user: CurrentUser, contentFiltering: boolean) => {

    console.log("user in setUserAndRefresh Func", user);
    setUser(user, contentFiltering);

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
        refetchQueries(getQueryKeys("notifications_uid", { uid: user._id }));
        toast.success(data.title, { icon: "🔔" });

        useNotification.setState({ newNotification: true }, true);
    }

    const handleMessageArrival = ({ data }: { data?: AblyEventParams["message"] }) => {
        if (!data || data.user_id === user._id) return;

        const { room_id, room, ...rest } = data;

        showMessageOptimistically({ message: { ...rest, room_id }, room, uid: user._id })

        if (typeof "window" === undefined) return;

        else if (window.location.pathname.startsWith(`/inbox/${room_id}`)) {
            ably.channels.get(data.user_id).publish("entered_chat", {
                room_id,
                time: Date.now(),
                user_id: user._id,
            } as AblyEventParams["entered_chat"]);
        } else {
            toast.success(`New message arrived from ${room.display_name}`);
        }
    }

    const handleEnterChat = ({ data }: { data?: AblyEventParams["entered_chat"] }) => {
        console.log("Entered chat", data);
        if (!data || data.user_id === user._id) return;

        updateDoc(
            getQueryKeys("room_rmid_uid", { rmid: data.room_id, uid: user._id }),
            { otherParticipant_seenAt: data.time }
        )

        updateDocInInfiniteQueryResult<MereRoomType>(
            getQueryKeys("rooms_uid", { uid: user._id }),
            (room) => room.room_id === data.room_id,
            { otherParticipant_seenAt: data.time }
        )

    }

    const handleVisibility = () => {
        if (document.visibilityState === "hidden") {
            channel.presence.leave({ status: "offline" });
        } else {
            channel.presence.enter({ status: "online" });
        }
    }

    document.addEventListener("visibilitychange", handleVisibility)

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