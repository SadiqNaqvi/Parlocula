"use client";

import { AddIcon, AppIcon, ExploreFillIcon, ExploreIcon, HomeFillIcon, HomeIcon, MessagesFillIcon, MessagesIcon, ThreadIcon, UserIcon } from "@assets/Icons";
import { getPoster } from "@lib/utils";
import useCurrentUser from "@store/user";
import { usePathname } from "next/navigation";
import Navigate from "./Navigate";
import NotificationButton from "./notifications/NotificationButton";
import Image from "next/image";
import React from "react";
import BottomSheet from "./BottomSheet";
import { ParloImage } from "./ui";

const ProfileButton = () => {

    const { meta } = useCurrentUser();
    const pathname = usePathname();

    if (!meta) return (
        <div className={`rounded-full border-2 ${pathname.startsWith(`/guest`) ? "border-secondary" : "border-gray-500"}`}>
            <Navigate comp="link" goto="/guest">
                <UserIcon className="m-2.5 size-5" />
            </Navigate>
        </div>
    )

    return (
        <div className={`rounded-full border-2 ${pathname.startsWith(`/user/${meta.username}`) ? "border-secondary" : "border-gray-500"}`}>
            <Navigate comp="link" goto={`/user/${meta.username}`}>
                <ParloImage
                    alt="Profile picture of the current user"
                    size={40}
                    className="min-w-10 min-h-10 object-cover rounded-full"
                    frame={meta.profile}
                />
            </Navigate>
        </div>
    )

}

const AddButton = ({ className }: { className?: string }) => {

    return (
        <BottomSheet button={<AddIcon className={className} />}>
            <div className="flex gap-4 p-4">
                <Navigate comp="link" type="button" goto="/post/new" className="p-2 border border-dashed border-gray40">
                    New Post
                </Navigate>
                <Navigate comp="link" type="button" goto="/thread/new" className="p-2 border border-dashed border-gray40">
                    New Thread
                </Navigate>
            </div>
        </BottomSheet>
    )

}

type ButtonProps = {
    href?: string,
    label?: string,
    pathname?: string;
    Icon: React.ComponentType<{ className?: string }>,
    ActiveIcon?: React.ComponentType<{ className?: string }>,
}

const SidebarButton = ({ href, label, pathname, ActiveIcon, Icon }: ButtonProps) => {

    const IconToShow = ({ className }: { className?: string }) => {

        if (href && pathname?.startsWith(href) && ActiveIcon)
            return <ActiveIcon className={className} />;

        return <Icon className={className} />;
    }

    if (pathname && href) return (
        <li title={label} key={label} className="w-fit md:w-full">
            <Navigate
                comp="link" goto={href}
                className={`flex flex-cntr-all w-full transition-colors ${pathname.startsWith(href) ? "nav-active color-secondary" : ""}`}
            >
                <IconToShow className="size-6" />
            </Navigate>
        </li>
    )

    return (
        <li title={label} key={label} className="w-fit md:w-full">
            <button className="flex flex-cntr-all w-full">
                <IconToShow className="size-6" />
            </button>
        </li>

    )

}

// const links = [
//     { label: "Home", link: "/home", icon: HomeIcon, activeIcon: HomeFillIcon },
//     { label: "Explore", link: "/explore", icon: ExploreIcon, activeIcon: ExploreFillIcon },
//     { label: "New posts", link: "/new", icon: AddIcon, activeIcon: AddIcon },
//     { label: "Threads", link: "/thread", icon: ThreadIcon, activeIcon: ThreadIcon },
//     { label: "Inbox", link: "/inbox", icon: MessagesIcon, activeIcon: MessagesFillIcon },
// ];

const Sidebar = () => {

    const pathname = usePathname();

    return (
        <nav id="sidebar" className="fixed bottom-0 md:top-0 flex md:flex-col px-2 md:px-0 md:py-6 flex-cntr-between z-[4] h-16 md:h-dvh w-dvw md:w-20 border-t md:border-r md:border-t-0 border-gray20">

            <div className="hidden md:block">
                <AppIcon className="h-8 stroke-[32] stroke-current overflow-visible" />
            </div>

            <ul className="flex md:block w-full flex-cntr-between md:space-y-8">

                <SidebarButton pathname={pathname} Icon={HomeIcon} ActiveIcon={HomeFillIcon} href="/home" label="Home" />

                <SidebarButton pathname={pathname} Icon={ExploreIcon} ActiveIcon={ExploreFillIcon} href="/explore" label="Explore" />

                <SidebarButton pathname={pathname} Icon={AddButton} label="New" />

                <SidebarButton pathname={pathname} Icon={ThreadIcon} href="/thread" label="Threads" />

                <li title="Notifications" className="w-fit sm:w-full">
                    <NotificationButton active={pathname.startsWith("/notifications")} />
                </li>

                <SidebarButton pathname={pathname} Icon={MessagesIcon} ActiveIcon={MessagesFillIcon} href="/inbox" label="Inbox" />

                {/* {links.map(el => (
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
                )} */}

            </ul>

            <ProfileButton />
        </nav>
    )
}

export default Sidebar;