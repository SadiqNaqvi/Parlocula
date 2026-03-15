"use client";

import { BellFillIcon, BellIcon } from "@assets/Icons";
import { getQueryClient } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import useNotification from "@store/notification";
import useCurrentUser from "@store/user";
import { InfiniteScrollerDataType } from "@type/other";
import { useEffect } from "react";
import Navigate from "../Navigate";
import { OptionalChildren } from "@components/ui";

const NotificationButton = ({ active }: { active: boolean }) => {
    const { user, isHydrated } = useCurrentUser();
    const { checkNewNotification, newNotification, isHydrated: hydrated } = useNotification();

    useEffect(() => {
        if (!user || !isHydrated || !hydrated) return;

        const result = getQueryClient().getQueryData<InfiniteScrollerDataType>(getQueryKeys("notifications_uid", { uid: user._id }));
        if (!result) return;
        checkNewNotification(result.pages[0]?.results[0]);

    }, [user, isHydrated, checkNewNotification, hydrated]);

    return (
        <div className={newNotification ? "notificationBadge" : "contents"}>
            <OptionalChildren condition={active} fallback={<BellIcon />}>
                <BellFillIcon />
            </OptionalChildren>
        </div>
    )
}

export default NotificationButton;