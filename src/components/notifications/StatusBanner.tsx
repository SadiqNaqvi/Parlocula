"use client";

import Navigate from "@components/Navigate";
import { getPushSubscription } from "@lib/providers/push";
import useCurrentUser from "@store/user";
import { useEffect, useState } from "react";

const StatusBanner = () => {

    const [isEnabled, setIsEnabled] = useState(false);
    const { meta } = useCurrentUser();

    useEffect(() => {
        if (!meta) return;
        getPushSubscription().then(r => {
            if (r) setIsEnabled(true);
        });

    }, [meta]);

    if (!meta) return null;

    if (!isEnabled) return (
        <section className="px-2 my-4 py-4 space-y-3">

            <h2 className="sm:text-xl">Push Notification is not enabled 😨</h2>
            <p className="text-sm">
                This means we cannot notify you with any update related to you account when the app is closed.
            </p>
            <p className="text-sm">
                Please enable notification to keep yourself updated even when the app is closed.
            </p>

            <Navigate
                className="primary rounded-full btn"
                type="button"
                comp="link"
                goto="/settings/notification">
                View
            </Navigate>

        </section>
    )
}

export default StatusBanner;