'use client';

import { AppIcon } from '@assets/Icons';
import { Navigate } from '@components';
import { authenticateUser } from '@lib/helpers/server';
import { logOutOnClient, setUserOnRefreshOrLogin } from '@lib/helpers/user';
import { getQueryClient } from '@lib/providers/queryClient';
import { getQueryKeys } from '@lib/utils';
import useCurrentUser from '@store/user';
import { CurrentUser, TokenPayload } from '@type/internal';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export const PushNotificationWarningToast = () => {
    toast("Push Notification is not enabled!", {
        icon: null,
        className: "bg-primarylight border border-gray30 rounded-md grid grid-cols-2 p-2 gap-2",
        description: "We cannot notify you anything related to your account.",
        descriptionClassName: "text-sm my-2",
        classNames: {
            cancelButton: "secondary col-start-2 -col-end-1 row-start-2",
            content: "col-span-2",
            title: "text-lg"
        },
        action: (
            <Navigate comp="button" goto="/settings/notifications" className="inline primary btn col-start-1 col-end-2">
                View
            </Navigate>
        ),
        cancel: { label: "Dismiss", onClick: () => { } },
        duration: 3600 * 1000,
        unstyled: true,

    })
}

const checkIfInAppBrowser = () => {
    const ua = navigator.userAgent || navigator.vendor;

    const appBrowsers =
        /(Instagram|FBAN|FBAV|FB_IAB|TikTok|Snapchat|Twitter|Line|LinkedIn|Pinterest)/i.test(ua);

    const iOSWebView =
        /iPhone|iPad|iPod/.test(ua) && !/Safari/i.test(ua);

    return appBrowsers || iOSWebView;
}

const UserHydrator = ({ payload, currentUser }: { payload: TokenPayload | null, currentUser: CurrentUser | null }) => {

    const { user } = useCurrentUser();
    const pathname = usePathname();
    const router = useRouter();
    const [isInAppBrowser, setIsInAppBrowser] = useState(false);

    useEffect(() => {
        if (payload || !user) return;

        // If payload is not available (sometimes on first load from notification click, cookies are not set properly);
        // Rely on cached user data until user is authenticated;
        authenticateUser()
            .then(resp => {

                if (!resp) logOutOnClient(user._id);
                else router.refresh();
            })
            .catch(e => console.log(e));

        return setUserOnRefreshOrLogin(user, !!user.filterContent);
    }, [user]);

    useEffect(() => {

        setIsInAppBrowser(checkIfInAppBrowser());

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .catch(err => console.log('SW failed', err))
            })
        }

        if (!payload) return;

        const { username } = payload;

        const queryClient = getQueryClient();
        const qkeys = getQueryKeys("user_username", { username });
        let userToStore: CurrentUser | null = null;

        // Update user hash with the freshly fetched user data.
        if (currentUser) {
            userToStore = currentUser;
        }

        else {

            // For offline
            // The Local Storage (indexed db here) may got cleared but we know that the user exists.
            if (!user) return;

            userToStore = user;
            queryClient.setQueryData(qkeys, user);
        }

        return setUserOnRefreshOrLogin(userToStore, payload.filterContent);

    }, []);

    // Handle prev navigation, redirect user to home page when navigating backward if no history state exists.
    useEffect(() => {
        const handlePrevNavigation = (event: any) => {
            const state = event.state;

            if (!state || state.app !== "Parlocula" || state.type !== "root" || pathname.includes("/home")) return;

            // If user is at root, redirect them to home page;
            router.replace('/home');
        }

        window.history.replaceState({ app: "Parlocula", type: "root" }, "");

        window.history.pushState({ app: "Parlocula", type: "guard" }, "");

        window.addEventListener("popstate", handlePrevNavigation);
        return () => {
            window.removeEventListener("popstate", handlePrevNavigation);
        }

    }, []);

    const openInBrowser = () => {
        window.open(window.location.href, "_blank");
    };

    if (isInAppBrowser) return (
        <section className="fixed bg-primary z-50 inset-0 flex flex-cntr-all">
            <AppIcon className="size-12 md:size-24 customSize" />
            <div className="w-full space-y-4 absolute left-[50%] -translate-x-[50%] bottom-10 px-2">
                <button
                    className="primary w-full sm:w-96 mx-auto"
                    onClick={openInBrowser}>Open in browser</button>
                <p className="text-center text-sm">You are viewing this app in an isolated environment. It is recommended to open this app in your native browser</p>
            </div>
        </section>
    )

    return null;
}

export default UserHydrator;
