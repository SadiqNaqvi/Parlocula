"use client";

import { AppIcon, ExploreFillIcon, ExploreIcon, GroupIcon, GroupIconFill, HomeFillIcon, HomeIcon, MessagesFillIcon, MessagesIcon, ShelfIcon, ShelfIconFill, UserWithoutCircleIcon } from "@assets/Icons";
import { Navigate } from "@components";
import useCurrentUser from "@store/user";
import { usePathname } from "next/navigation";
import React, { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import NotificationButton from "./notifications/NotificationButton";
import { Button, OptionalChildren, ParloImage } from "./ui";

const ProfileButton = () => {

    const meta = useCurrentUser(state => state.meta);
    const pathname = usePathname();

    if (!meta) return (
        <div className={`rounded-full border-2 ${pathname.startsWith(`/guest`) ? "border-secondary" : "border-gray-500"}`}>
            <Navigate
                aria-label="Guest Profile"
                title="Guest Profile"
                comp="link"
                goto="/guest"
            >
                <UserWithoutCircleIcon className="m-2.5 size-4 md:size-5" />
            </Navigate>
        </div>
    )

    return (
        <div className={`rounded-full border-2 ${pathname.startsWith(`/u/${meta.username}`) ? "border-secondary" : "border-gray-500"}`}>
            <Navigate
                aria-label="Visit Your Profile"
                title="Your Profile"
                comp="link"
                goto={`/u/${meta.username}`}
            >
                <ParloImage
                    frameType="userProfile"
                    alt="Profile picture of the Current User"
                    size={40}
                    sizes={[
                        { maxScreenWidth: 480, imageWidth: 32 },
                        { imageWidth: 40 },
                    ]}
                    classNameForFallback="min-w-5 size-5"
                    className="min-w-8 size-8 sm:min-w-10 sm:size-10 object-cover"
                    containerClassName="rounded-full"
                    frame={meta.profile}
                />
            </Navigate>
        </div>
    )

}

type ButtonProps = {
    href?: string,
    label: string,
    pathname?: string;
    ActiveIcon?: React.ComponentType<{ className?: string }>,
    className?: string;
    skipButtonWrapping?: boolean;
}

const defaultButtonClasses = "w-fit md:mx-auto"
const iconSize = "size-5"

const SidebarButton = ({ href, label, pathname, ActiveIcon, children, className, skipButtonWrapping }: PropsWithChildren<ButtonProps>) => {

    if (href && typeof pathname === "string") return (
        <li title={label} key={label} className={twMerge(defaultButtonClasses, className)}>
            <Navigate
                aria-label={label}
                title={label}
                comp="link" goto={href}
                className={`flex flex-cntr-all transition-colors p-2 rounded-md border ${pathname.startsWith(href) ? "color-secondary bg-gray10 border-gray30" : "bg-transparent border-transparent"}`}
            >
                {pathname.startsWith(href) && ActiveIcon ?
                    <ActiveIcon className={iconSize} />
                    :
                    children
                }
            </Navigate>
        </li>
    )

    return (
        <li key={label} className={twMerge(defaultButtonClasses, className)}>
            <OptionalChildren condition={!skipButtonWrapping} fallback={children}>
                <Button
                    id={`sidebar-button-for-${label}`}
                    title={label}
                    className="flex flex-cntr-all w-full"
                >
                    {children}
                </Button>
            </OptionalChildren>
        </li>
    )
}

const Sidebar = () => {

    const pathname = usePathname();

    return (
        <nav id="sidebar" className="fixed bottom-0 md:top-0 flex md:flex-col px-2 md:py-6 flex-cntr-between z-[4] h-16 md:h-dvh w-dvw md:w-20 border-t md:border-r md:border-t-0 border-gray20">

            <div className="hidden md:block">
                <AppIcon className="h-8 overflow-visible" />
            </div>

            <ul className="contents md:block w-full flex-cntr-between md:space-y-8">

                <SidebarButton pathname={pathname} ActiveIcon={HomeFillIcon} href="/home" label="Home">
                    <HomeIcon className={iconSize} />
                </SidebarButton>

                <SidebarButton pathname={pathname} ActiveIcon={ExploreFillIcon} href="/explore" label="Explore">
                    <ExploreIcon className={iconSize} />
                </SidebarButton>

                <SidebarButton pathname={pathname} ActiveIcon={ShelfIconFill} href="/shelf" label="Shelf">
                    <ShelfIcon />
                </SidebarButton>

                {/* 
                <SidebarButton skipButtonWrapping pathname={pathname} label="New">
                    <AddButton className="size-6" />
                </SidebarButton> */}

                <SidebarButton pathname={pathname} ActiveIcon={GroupIconFill} href="/thread" label="Threads">
                    <GroupIcon className={iconSize} />
                </SidebarButton>

                <SidebarButton className="hidden md:block" pathname={pathname} href="/notifications" label="Notifications">
                    <NotificationButton />
                </SidebarButton>

                <SidebarButton className="hidden md:block" pathname={pathname} ActiveIcon={MessagesFillIcon} href="/room" label="Rooms">
                    <MessagesIcon className={iconSize} />
                </SidebarButton>

            </ul>

            <ProfileButton />
        </nav>
    )
}

export default Sidebar;