"use client";

import { AddIcon, AppIcon, ExploreFillIcon, ExploreIcon, HomeFillIcon, HomeIcon, MessagesFillIcon, MessagesIcon, ThreadIcon, UserIcon } from "@assets/Icons";
import { getPoster } from "@lib/utils";
import useCurrentUser from "@store/user";
import { usePathname } from "next/navigation";
import Navigate from "./Navigate";
import NotificationButton from "./notifications/NotificationButton";

export default function Sidebar() {

    const pathname = usePathname();

    const { user, isHydrated } = useCurrentUser();

    const links = [
        { label: "Home", link: "/home", icon: HomeIcon, activeIcon: HomeFillIcon },
        { label: "Explore", link: "/explore", icon: ExploreIcon, activeIcon: ExploreFillIcon },
        // { label: "Generate", link: "/generate", icon: MagicStickIcon, activeIcon: MagicStickFillIcon },
        { label: "New posts", link: "/new", icon: AddIcon, activeIcon: AddIcon },
        { label: "Threads", link: "/t", icon: ThreadIcon, activeIcon: ThreadIcon },
        { label: "Inbox", link: "/inbox", icon: MessagesIcon, activeIcon: MessagesFillIcon },
    ];

    return (
        <nav id="sidebar" className="fixed bottom-0 md:top-0 flex md:flex-col px-2 md:px-0 md:py-6 flex-cntr-between z-[10] h-16 md:h-dvh w-dvw md:w-20 border-t md:border-r md:border-t-0 border-gray20">
            <div className="hidden md:block">
                <AppIcon className="h-8 stroke-[32] stroke-current overflow-visible" />
            </div>

            <ul className="flex md:block w-full flex-cntr-between md:space-y-8">
                {links.map(el => (
                    <li title={el.label} key={el.label} className="text-lg w-full">
                        <Navigate comp="link" className={`flex flex-cntr-all w-full active:text-secondary md:hover:text-secondary transition-colors ${pathname.includes(el.link) ? "nav-active color-secondary" : ""}`} goto={el.link}>
                            {pathname.startsWith
                                (el.link) ?
                                <el.activeIcon className="h-6" />
                                :
                                <el.icon className="h-6" />
                            }
                        </Navigate>
                    </li>
                )
                )}
                <li title="Notifications" className="text-lg w-full">
                    <NotificationButton active={pathname.startsWith("/notifications")} />
                </li>
            </ul>

            <div className={`rounded-full ${isHydrated ? "" : "userIconLoading"} border-2 ${user && pathname.startsWith(`/u/${user.username}`) ? "border-secondary" : "border-gray-500"}`}>
                <Navigate comp="link" goto="/me">
                    {user ?
                        <img className="size-10 min-w-10 min-h-10 object-cover rounded-full" src={getPoster({ path: user.profile })} />
                        :
                        <UserIcon className="m-2.5 size-5" />
                    }
                </Navigate>
            </div>
        </nav >
    )
}

/*
1. in /new, fix how to choose thread. Fetch the first 20 threads and store it in client using useOfflineStore 

*/