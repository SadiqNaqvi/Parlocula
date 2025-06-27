"use client";

import { AddIcon, AppIcon, BellFillIcon, BellIcon, ExploreFillIcon, ExploreIcon, HomeFillIcon, HomeIcon, MagicStickFillIcon, MagicStickIcon, MessagesFillIcon, MessagesIcon, ThreadIcon, UserIcon } from "@assets/Icons";
import { getPoster } from "@lib/utils";
import useCurrentUser from "@store/user";
import { usePathname } from "next/navigation";
import Navigate from "./Navigate";

export default function Sidebar() {

    const pathname = usePathname();

    const { user, isHydrated } = useCurrentUser();

    const links = [
        { label: "Home", link: "/home", icon: HomeIcon, activeIcon: HomeFillIcon },
        { label: "Explore", link: "/explore", icon: ExploreIcon, activeIcon: ExploreFillIcon },
        // { label: "Generate", link: "/generate", icon: MagicStickIcon, activeIcon: MagicStickFillIcon },
        { label: "Threads", link: "/t", icon: ThreadIcon, activeIcon: ThreadIcon },
        { label: "New posts", link: "/new", icon: AddIcon, activeIcon: AddIcon },
        // { label: "Inbox", link: "/inbox", icon: MessagesIcon, activeIcon: MessagesFillIcon },
        // { label: "Notification", link: "/notification", icon: BellIcon, activeIcon: BellFillIcon },
    ];

    return (
        <nav id="sidebar" className="fixed bottom-0 md:top-0 flex md:flex-col px-2 md:px-0 md:py-6 flex-cntr-between z-[10] h-16 md:h-dvh w-dvw md:w-20 border-t md:border-r md:border-t-0 border-gray20">
            <div className="hidden md:block">
                <AppIcon className="h-8 stroke-[32] stroke-current overflow-visible" />
            </div>
            <ul className="flex md:block w-full flex-cntr-between md:space-y-8">
                {links.map(el => (
                    <li key={el.label} className="text-lg w-full">
                        <Navigate comp="link" className={`flex flex-cntr-all w-full active:text-secondary md:hover:text-secondary transition-colors ${pathname.includes(el.link) ? "nav-active color-secondary" : ""}`} goto={el.link}>
                            {pathname.startsWith
                                (el.link) ?
                                <el.activeIcon className="h-6" />
                                :
                                <el.icon className="h-6" />
                            }
                        </Navigate>
                    </li>
                ))}
            </ul>
            <div className={`rounded-full ${isHydrated ? "" : "userIconLoading"} border-2 ${user && pathname.startsWith(`/u/${user.username}`) ? "border-secondary" : "border-gray-500"}`}>
                <Navigate comp="link" goto="/me">
                    {user ?
                        <img className="size-10 min-w-10 min-h-10 aspect-square rounded-full" src={getPoster({ path: user.profile })} />
                        :
                        <UserIcon className="m-2" />
                    }
                </Navigate>
            </div>
        </nav >
    )
}
