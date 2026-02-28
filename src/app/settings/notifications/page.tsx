"use client";

import { Navbar } from "@components";
import ToggleButtonBar from "@components/ui/ToggleButtonBar";
import { sendTestNotification } from "@lib/helpers/server";
import { checkPushStatus, disablePush, enablePush } from "@lib/providers/notification";
import appToast from "@lib/providers/toast";
import useCurrentUser from "@store/user";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

    const [status, setStatus] = useState<NotificationPermission>("default");
    const { meta } = useCurrentUser();

    useEffect(() => setStatus(checkPushStatus()), []);

    if (!meta) return null;

    const checkStatus = () => {
        setStatus(checkPushStatus())
    }

    const togglePushNotification = async () => {
        if (status === "granted") {
            toast.promise(disablePush(meta.user_id), { success: "Notification Disabled." });
        } else {
            toast.promise(enablePush(meta.user_id), { success: "Notification Enabled." });
        }
        checkStatus();
    }

    const testNotification = async () => {
        await sendTestNotification(meta.user_id);
        appToast.success("Notification send");
    }

    return (
        <>
            <Navbar navTitle="Push Notification" className="border-b border-gray20" />
            <section className="mt-6 px-2">
                <ToggleButtonBar
                    onClick={togglePushNotification}
                    checked={status === "granted"}
                    label="Allow Notifications"
                />
                <div className="space-y-2 mt-8">
                    <StatusBanned granted={status === "granted"} />
                </div>
            </section>

            <button className="primary" onClick={testNotification}>Test</button>
        </>
    )
}

export default NotificationSettingsPage;