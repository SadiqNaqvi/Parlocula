"use client";

import { Navbar } from "@components";
import { Form, Input } from "@components/form";
import { FullPageLoadingSpinner } from "@components/ui/loading/LoadingSpinner";
import ToggleButtonBar from "@components/ui/ToggleButtonBar";
import { sendTestNotification, subscribeToPush, unsubscribeToPush } from "@lib/helpers/server";
import { useDebounce } from "@lib/hooks";
import { getPushSubscription, subscribeToPushOnClient, unsubscribeToPushOnClient } from "@lib/providers/push";
import appToast from "@lib/providers/toast";
import { codetoError } from "@lib/utils";
import useCurrentUser from "@store/user";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const StatusBanned = ({ enabled }: { enabled: boolean }) => {

    if (enabled) return (
        <p className="text-sm">
            You will be notified with every update even when the app is closed. If you are not getting notified, try turning the above off and then on.
        </p>
    )

    return (
        <p className="text-sm">
            Push Notification is not enabled. This means we cannot notify you with any update related to you account when the app is closed. Enable notification to keep yourself updated even when the app is closed.
        </p>
    )

}

const NotificationPage = () => {

    const [enabled, setEnabled] = useState(false);
    const { meta, isHydrated } = useCurrentUser();
    const [isSupported, setIsSupported] = useState(false)
    const subscription = useRef<PushSubscription | null>(null);

    const { mutate, setFinalState, setInitialState } = useDebounce(
        async () => {
            if (!meta) return;
            else if (enabled) await unsubscribe();
            else await subscribe();
        }
    );

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true)
            getPushSubscription()
                .then(r => {
                    subscription.current = r;

                    if (r) {
                        setInitialState(true);
                        setEnabled(true)
                    } else {
                        setInitialState(false);
                    }
                });
        }
    }, []);

    if (!isHydrated) return <FullPageLoadingSpinner path={["Notification"]} />
    else if (!meta) return null;

    else if (!isSupported) return (
        <section className="h-size-screen flex flex-cntr-all space-y-3 px-2">
            <h3 className="text-center font-semibold">Uh Oh! Looks like you are using a vintage browser.</h3>
            <p className="text-center">Well Push notification is not supported in this browser. Move to a new one.</p>
        </section>
    )

    const subscribe = async () => {

        if (subscription.current) return;

        try {
            const sub = await subscribeToPushOnClient();

            const { success, errCode, customError } = await subscribeToPush(meta.user_id, JSON.parse(JSON.stringify(sub)));

            console.log("subscribed", success);

            if (success) {
                subscription.current = sub;
                setEnabled(true);
            } else {
                sub.unsubscribe();
                console.log("Error occured while subscribing to push notification", errCode, customError);
                appToast.error("Failed To enable Notification");
            }
        } catch (e: any) {
            console.log("Failed to subscribe");
            console.log(e);
            appToast.error("Failed to enable notification. Unstable Internet Connection")
            setEnabled(false);
        }
    }

    const unsubscribe = async () => {
        if (!subscription.current) return;

        const resp = await unsubscribeToPush(meta.user_id);
        const { success, customError, errCode } = resp;

        console.log("unsubscribed", success);

        if (success) {
            await unsubscribeToPushOnClient(subscription.current);
            subscription.current = null;
            setEnabled(false);
        } else {
            console.log("Error occured while unsubscribing to push notification", errCode, customError);
            appToast.error("Failed To disable Notification");
            setEnabled(true);
        }
    }

    const testNotification = async (data: { username: string, message: string }) => {

        if (!subscription) {
            toast.error("Enable notification first");
            return;
        }

        toast.promise(() => sendTestNotification(data.username, data.message), {
            loading: "Sending Notification...",
            success: ({ success, customError, errCode }) => {
                if (success)
                    return "Test Notification sent successfully"
                throw Error(customError || codetoError(errCode))
            },
            error: (e) => "Unable to send test notification: " + e.message,
        });
    }

    const togglePushNotification = async () => {
        mutate();

        if (enabled) {
            setEnabled(false);
            setFinalState(false);
        } else {
            Notification.requestPermission();
            setFinalState(true);
            setEnabled(true);
        }
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

            <Form submit={testNotification}>
                <Input name="username" placeholder="Username" />
                <Input name="message" placeholder="Message" />
                <button className="primary" type="submit">Test</button>
            </Form>
        </>
    )
}

export default NotificationPage;