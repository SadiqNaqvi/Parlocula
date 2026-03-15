"use client";

import { InfiniteScroller, Navbar } from "@components";
import LoginModal from "@components/fallbacks/LoginModal";
import StatusBanner from "@components/notifications/StatusBanner";
import NotificationTile from "@components/ui/NotificationTile";
import { getNotificationsOfUser } from "@lib/helpers/common";
import { getQueryKeys } from "@lib/utils";
import useNotification from "@store/notification";
import useCurrentUser from "@store/user";
import { useEffect } from "react";

const NotificationPage = () => {

    const { meta } = useCurrentUser();

    useEffect(() => {
        if (meta)
            useNotification.setState({ newNotification: false });
    }, []);

    if (!meta) return (
        <LoginModal redirectTo="/notifications" />
    )

    return (
        <main>
            <Navbar navTitle="Notifications" />
            <StatusBanner />
            <section className="bg-primary">
                <InfiniteScroller
                    Component={NotificationTile}
                    fetchData={(p) => getNotificationsOfUser(meta.user_id, p)}
                    queryKeys={getQueryKeys("notifications_uid", { uid: meta.user_id })}
                />
            </section>
        </main>
    )

}

export default NotificationPage;