"use client";

import { Navbar } from "@components";
import { FullPageLoadingSpinner } from "@components/ui/loading/LoadingSpinner";
import ToggleButtonBar from "@components/ui/ToggleButtonBar";
import { sendTestNotification } from "@lib/helpers/server";
import { disablePush, enablePush } from "@lib/providers/pushNotification";
import useCurrentUser from "@store/user";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const StatusBanned = ({ enabled }: { enabled: boolean }) => {

    if (enabled) return (
        <>
            <h3 className="text-center">All Clear Here!</h3>
            <p className="text-sm">
                You will be notified with every update even when the app is closed. If you are not getting notified, try turning the above off and then on.
            </p>
        </>
    )

    return (
        <>
            <h3 className="text-center">You are missing out big time!</h3>
            <p className="text-sm">
                Push Notification is not enabled. This means we cannot notify you with any update related to you account when the app is closed. Enable notification to keep yourself updated even when the app is closed.
            </p>
        </>
    )

}

const NotificationPage = ({ status }: { status: boolean }) => {

    const [enabled, setEnabled] = useState(status);
    const { meta, isHydrated } = useCurrentUser();

    useEffect(() => {
        if (enabled && Notification.permission !== "granted")
            setEnabled(false);
    }, []);

    useEffect(() => console.log("notification", enabled), [enabled]);

    if (!isHydrated) return <FullPageLoadingSpinner path={["Notification"]} />
    else if (!meta) return null;

    const checkBrowserPushStatus = () => {
        return Notification.permission;
    }

    const togglePushNotification = async () => {
        if (enabled) {
            setEnabled(() => false);
            toast.promise(() => disablePush(meta.user_id), {
                success: "Notification Disabled.",
                error: () => {
                    console.log("entered disabled error");
                    setEnabled(true);
                    return "Failed to disable Notification"
                }
            });
        } else {
            const browserStatus = checkBrowserPushStatus();
            if (browserStatus !== "granted" && await Notification.requestPermission() !== "granted")
                return;

            setEnabled(() => true);

            await enablePush(meta.user_id, undefined, () => setEnabled(false));
            // toast.promise(enablePush(meta.user_id), {
            //     success: "Notification Enabled.",
            //     error: () => {
            //         console.log("entered disabled error");
            //         setEnabled(false);
            //         return "Failed to enable Notification";
            //     }
            // });
        }
    }

    const testNotification = async () => {
        toast.promise(() => sendTestNotification(meta.user_id), {
            success: "Test Notification sent successfully",
            error: "Unable to send test notification",
        });
    }

    return (
        <>
            <Navbar navTitle="Push Notification" className="border-b border-gray20" />
            <section className="mt-6 px-2">
                <ToggleButtonBar
                    onClick={togglePushNotification}
                    checked={enabled}
                    label="Allow Notifications"
                />
                <div className="space-y-2 mt-8">
                    <StatusBanned enabled={enabled} />
                </div>
            </section>

            <button className="primary" onClick={testNotification}>Test</button>
        </>
    )
}

export default NotificationPage;