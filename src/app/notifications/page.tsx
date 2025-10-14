"use client";

import { InfiniteScroller, Navbar, Navigate } from "@components";
import StatusBanner from "@components/notifications/StatusBanner";
import { ShowError } from "@components/ui";
import { FullPageLoadingSpinner } from "@components/ui/LoadingSpinner";
import NotificationTile from "@components/ui/NotificationTile";
import { getNotificationsOfUser } from "@lib/helpers/common";
import { getQueryKeys, queryFunction } from "@lib/utils";
import useNotification from "@store/notification";
import useCurrentUser from "@store/user";
import { useEffect } from "react";

const NotificationPage = () => {

    const { user, isHydrated } = useCurrentUser();
    if (!isHydrated) return (
        <FullPageLoadingSpinner path={["Notifications"]} />
    )

    else if (!user) return (
        <section className="size-screen space-y-4">
            <ShowError heading="You need to log-in to proceed" />
            <Navigate comp="link" goto="/join" className="primary">Log in</Navigate>
        </section>
    )

    useEffect(() => {
        useNotification.setState({ newNotification: false }, true)
    }, [])

    return (
        <main>
            <Navbar navTitle="Notifications" />
            <StatusBanner />
            <section className="bg-primary">
                <InfiniteScroller
                    Component={NotificationTile}
                    fetchData={(p) => queryFunction(getNotificationsOfUser, [user._id, p])}
                    queryKeys={getQueryKeys("notifications_uid", { uid: user._id })}
                    autoLoad={false}
                />
            </section>
        </main>

    )

}

export default NotificationPage;