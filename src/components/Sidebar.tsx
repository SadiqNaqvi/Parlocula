"use client";

import { AppIcon, BellFillIcon, BellIcon, ExploreFillIcon, ExploreIcon, HomeFillIcon, HomeIcon, MagicStickFillIcon, MagicStickIcon, MessagesFillIcon, MessagesIcon, ThreadIcon, UserIcon } from "@assets/Icons";
import { getInternalPoster } from "@lib/utils";
import useCurrentUser from "@store/user";
import { usePathname } from "next/navigation";
import Navigate from "./Navigate";

export default function Sidebar() {

    const pathname = usePathname();

    const { user, isHydrated } = useCurrentUser();

    const links = [
        { label: "Home", link: "/home", icon: HomeIcon, activeIcon: HomeFillIcon },
        { label: "Explore", link: "/explore", icon: ExploreIcon, activeIcon: ExploreFillIcon },
        { label: "Generate", link: "/generate", icon: MagicStickIcon, activeIcon: MagicStickFillIcon },
        { label: "Threads", link: "/t", icon: ThreadIcon, activeIcon: ThreadIcon },
        { label: "Inbox", link: "/inbox", icon: MessagesIcon, activeIcon: MessagesFillIcon },
        { label: "Notification", link: "/notification", icon: BellIcon, activeIcon: BellFillIcon },
    ];

    return (
        <nav className="bg-primarylight md:bg-primary fixed bottom-0 md:top-0 flex md:flex-col px-2 md:px-0 md:py-6 flex-cntr-between z-[10] h-16 md:h-dvh w-dvw md:w-20 border-t md:border-r md:border-t-0 border-gray20">
            <div className="hidden md:block">
                <AppIcon classnames="h-8 stroke-[32] stroke-current overflow-visible" />
            </div>
            <ul className="flex md:block w-full flex-cntr-between md:space-y-8">
                {links.map(el => (
                    <li key={el.label} className="text-lg w-full">
                        <Navigate comp="link" className={`flex flex-cntr-all w-full active:text-secondary md:hover:text-secondary transition-colors ${pathname.includes(el.link) ? "nav-active color-secondary" : ""}`} goto={el.link}>
                            {pathname.startsWith
                                (el.link) ?
                                <el.activeIcon classnames="h-6" />
                                :
                                <el.icon classnames="h-6" />
                            }
                        </Navigate>
                    </li>
                ))}
            </ul>
            <Navigate comp="link" goto="/me" className={`rounded-full ${isHydrated ? "" : "userIconLoading"} border-2 ${pathname.startsWith("/me") ? "border-secondary" : "border-gray-500"}`}>
                {user ?
                    <img className="h-10 aspect-square rounded-full" src={getInternalPoster({ path: user.profile, options: { width: "40" } })} />
                    :
                    <UserIcon classnames="m-2" />
                }
            </Navigate>
        </nav>
    )
}
