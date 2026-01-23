"use client";

import { AddIcon, AppIcon, ExploreFillIcon, ExploreIcon, PostIcon, ThreadIconFill, HomeFillIcon, HomeIcon, MessagesFillIcon, MessagesIcon, ThreadIcon, UserIcon } from "@assets/Icons";
import useCurrentUser from "@store/user";
import { usePathname } from "next/navigation";
import React, { PropsWithChildren, useEffect } from "react";
import { BottomSheet, Navigate } from "@components";
import NotificationButton from "./notifications/NotificationButton";
import { OptionalChildren, ParloImage } from "./ui";
import { twMerge } from "tailwind-merge";
import * as ThumbHash from "thumbhash"

const ProfileButton = () => {

    const meta = useCurrentUser(state => state.meta);
    const pathname = usePathname();
    useEffect(() => console.log("meta in sidebar", meta), [meta]);

    // const takeHash = async () => {
    //         if (!meta?.profile) return;
    //         const src = typeof meta.profile === "string" ? meta.profile : meta.profile.path;
    //         const image = new Image
    //         image.src = src;
    //         image.crossOrigin = "Anonymous";
    //         await new Promise(resolve => image.onload = resolve)
    //         const canvas = document.createElement('canvas')
    //         const context = canvas.getContext('2d')
    //         const scale = 100 / Math.max(image.width, image.height)
    //         canvas.width = Math.round(image.width * scale)
    //         canvas.height = Math.round(image.height * scale);

    //         if (!context) return;
    //         context.drawImage(image, 0, 0, canvas.width, canvas.height)
    //         const pixels = context.getImageData(0, 0, canvas.width, canvas.height)
    //         const binaryThumbHash = ThumbHash.rgbaToThumbHash(pixels.width, pixels.height, pixels.data)

    //         // ThumbHash to data URL
    //         const placeholderURL = ThumbHash.thumbHashToDataURL(binaryThumbHash)

    //         console.log(binaryThumbHash);
    //         console.log(placeholderURL);

    //     }

    //     return (
    //         <button onClick={takeHash}>
    //             click
    //         </button>
    //     )

    if (!meta) return (
        <div className={`rounded-full border-2 ${pathname.startsWith(`/guest`) ? "border-secondary" : "border-gray-500"}`}>
            <Navigate comp="link" goto="/guest">
                <UserIcon className="m-2.5 size-4 md:size-5" />
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

const addButtonClasses = "size-[70px] flex gap-2 flex-cntr-all flex-col bg-primary rounded-md border border-gray40"

const AddButton = ({ className }: { className?: string }) => {

    return (
        <BottomSheet className="mx-auto" button={<AddIcon className={className} />}>
            <section className="p-6">
                <h3 className="text-center">Start Creating Now</h3>

                <div className="flex gap-4 mt-4 mx-auto w-fit">
                    <Navigate comp="link" type="button" goto="/post/new" className={addButtonClasses}>
                        <PostIcon className="size-6 mx-auto" />
                        <p className="text-sm text-zinc-500">Post</p>
                    </Navigate>
                    <Navigate comp="link" type="button" goto="/thread/new" className={addButtonClasses}>
                        <ThreadIcon className="size-6 mx-auto" />
                        <p className="text-sm text-zinc-500">Thread</p>
                    </Navigate>
                </div>
            </section>
        </BottomSheet>
    )

}

type ButtonProps = {
    href?: string,
    label?: string,
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
        <li title={label} key={label} className={twMerge(defaultButtonClasses, className)}>
            <OptionalChildren condition={!skipButtonWrapping} fallback={children}>
                <button className="flex flex-cntr-all w-full">
                    {children}
                </button>
            </OptionalChildren>
        </li>
    )
}

const OptionalSidebarButtons = ({ pathname, className }: { pathname: string, className?: string }) => (
    <>
        <SidebarButton className={className} pathname={pathname} href="/notifications" label="Notifications">
            <NotificationButton active={pathname.startsWith("/notifications")} />
        </SidebarButton>

        <SidebarButton className={className} pathname={pathname} ActiveIcon={MessagesFillIcon} href="/inbox" label="Inbox">
            <MessagesIcon className={iconSize} />
        </SidebarButton>
    </>
)

export const TopNavbar = ({ className }: { className?: string; }) => (
    <nav className={twMerge("sticky z-[1] top-0 p-4 border-b border-gray10 flex flex-cntr-between md:hidden bg-primary", className)}>
        <div className="text-lg">
            <AppIcon className="h-6 overflow-visible" />
        </div>
        <ul className="flex md:hidden flex-cntr-all">
            <OptionalSidebarButtons pathname="" />
        </ul>
    </nav>
)

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

                <SidebarButton skipButtonWrapping pathname={pathname} label="New">
                    <AddButton className="size-6" />
                </SidebarButton>

                <SidebarButton pathname={pathname} ActiveIcon={ThreadIconFill} href="/thread" label="Threads">
                    <ThreadIcon className={iconSize} />
                </SidebarButton>

                <OptionalSidebarButtons className="hidden md:block" pathname={pathname} />

            </ul>

            <ProfileButton />
        </nav>
    )
}

export default Sidebar;