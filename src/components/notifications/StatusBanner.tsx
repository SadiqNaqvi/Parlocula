"use client";

import Navigate from "@components/Navigate";
import { checkPushStatus } from "@lib/providers/pushNotification";
import useCurrentUser from "@store/user";

const StatusBanner = () => {

    const { meta } = useCurrentUser();

    if (!meta) return null;

    const status = checkPushStatus(meta.user_id);

    if (!status) return (
        <section className="my-4 py-4 border border-dashed border-gray40 space-y-3">

            <h2 className="sm:text-xl">You{"'"}re missing out big time 😨</h2>
            <p className="text-sm">
                Push Notification is not enabled. This means we cannot notify you with any update related to you account when the app is closed. Please enable notification to keep yourself updated even when the app is closed.
            </p>

            <Navigate
                className="primary rounded-full btn"
                type="button"
                comp="link"
                goto="/settings/notifications">
                View
            </Navigate>

        </section>
    )
}

export default StatusBanner;