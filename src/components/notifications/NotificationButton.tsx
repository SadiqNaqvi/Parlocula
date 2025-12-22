"use client";

import { getQueryClient } from "@lib/providers/queryClient";
import { getQueryKeys } from "@lib/utils";
import useNotification from "@store/notification";
import useCurrentUser from "@store/user";
import Navigate from "../Navigate";
import { BellFillIcon, BellIcon } from "@assets/Icons";
import { useEffect } from "react";
import { InfiniteQueryResponse } from "@type/internal";
import { InfiniteScrollerDataType } from "@type/other";

const NotificationButton = ({ active }: { active: boolean }) => {
    const { user, isHydrated } = useCurrentUser();
    const { checkNewNotification, newNotification, isHydrated: hydrated } = useNotification();

    useEffect(() => {
        if (!user || !isHydrated || !hydrated) return;

        const result = getQueryClient().getQueryData<InfiniteScrollerDataType>(getQueryKeys("notifications_uid", { uid: user._id }));
        if (!result) return;
        checkNewNotification(result.pages[0]?.results[0]);

    }, [user, isHydrated, checkNewNotification, hydrated])

    return (
        <Navigate comp="link" goto="/notifications">
            {active ?
                <BellFillIcon />
                :
                <BellIcon />
            }
        </Navigate>
    )
}

export default NotificationButton;