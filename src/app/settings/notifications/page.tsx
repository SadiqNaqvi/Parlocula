"use client";

import { Navbar } from "@components";
import ToggleButtonBar from "@components/ui/ToggleButtonBar";
import { checkPushStatus, disablePush, enablePush } from "@lib/providers/notification";
import useCurrentUser from "@store/user";
import { useState } from "react";

const StatusBanned = ({ granted }: { granted: boolean }) => {

    if (granted) return (
        <>
            <h3 className="font-semibold">All Clear Here!</h3>
            <p className="text-sm">
                You will be notified with every update even when the app is closed. If you are not getting notified, try turning the above off and then on.
            </p>
        </>
    )

    return (
        <>
            <h3 className="font-semibold">You are missing out big time!</h3>
            <p className="text-sm">
                Push Notification is not enabled. This means we cannot notify you with any update related to you account when the app is closed. Enable notification to keep yourself updated even when the app is closed.
            </p>
        </>
    )

}

const NotificationSettingsPage = () => {

    const [status, setStatus] = useState(checkPushStatus());
    const { meta } = useCurrentUser();

    if (!meta) return null;

    const checkStatus = () => {
        setStatus(checkPushStatus())
    }

    const togglePushNotification = async () => {
        if (status === "granted") {
            await disablePush(meta.user_id);
        } else {
            await enablePush(meta.user_id)
        }
        checkStatus();
    }

    return (
        <>
            <Navbar navTitle="Push Notification" />
            <section>
                <ToggleButtonBar
                    onClick={togglePushNotification}
                    checked={status === "granted"}
                    label="Allow Notifications"
                />
                <StatusBanned granted={status === "granted"} />
            </section>
        </>
    )


}

export default NotificationSettingsPage;