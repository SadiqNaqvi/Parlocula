"use client";

import { checkPushStatus, enablePush } from "@lib/providers/notification";
import useCurrentUser from "@store/user";

const StatusBanner = () => {

    const status = checkPushStatus();
    const { user } = useCurrentUser();

    if (user && status !== "granted") return (
        <section className="my-4 py-4 border border-dashed border-gray40 space-y-4">
            <h2 className="sm:text-xl">You{"'"}re missing out big time 😨</h2>
            <p className="text-sm">Push Notification is not enabled. This means we cannot notify you with any update related to you account when the app is closed. Please enable notification to keep yourself updated even when the app is closed.</p>
            <button className="secondary" onClick={() => enablePush(user._id)}>Enable Notification</button>
        </section>
    )

    return null;
}

export default StatusBanner;