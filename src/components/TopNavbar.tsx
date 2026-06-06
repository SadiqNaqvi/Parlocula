import { AddIcon, AppIcon, CollaborateIcon, EyesIcon, GlobeIcon, GroupIcon, HamburgerIcon, MessagesIcon, PostIcon, RightChevron, ShelfIcon, ShieldIcon } from "@assets/Icons";
import { BottomSheet, ShareButton } from "@components";
import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import Navigate from "./Navigate";
import NotificationButton from "./notifications/NotificationButton";
import { OptionalChildren } from "./ui";

type TopNavbarProps = PropsWithChildren<{
    className?: string;
    heading?: string;
    headingClassName?: string;
}>

export const TopNavbar = ({ className, children, heading, headingClassName }: TopNavbarProps) => (
    <nav className={twMerge("fullScreen sticky z-3 top-0 p-2 border-b border-gray10 flex flex-cntr-between bg-primary", className)}>
        <div>
            <OptionalChildren condition={heading} fallback={(
                <AppIcon className="size-6 overflow-visible" />
            )}>
                <h2 className={twMerge("text-lg", headingClassName)}>{heading}</h2>
            </OptionalChildren>
        </div>
        {children}
    </nav>
)

const addButtonClasses = "size-[70px] flex gap-2 flex-cntr-all flex-col bg-primary rounded-md border border-gray40"

const AddButton = ({ className }: { className?: string }) => {

    return (
        <BottomSheet className="p-2" button={<AddIcon className={className} />}>
            <section className="p-6">
                <h3 className="text-center font-semibold">Start Creating Now</h3>

                <div className="flex gap-4 mt-4 mx-auto w-fit">
                    <Navigate comp="link" type="button" goto="/new/post" className={addButtonClasses}>
                        <PostIcon className="size-6 mx-auto" />
                        <p className="text-sm text-zinc-500">Post</p>
                    </Navigate>
                    <Navigate comp="link" type="button" goto="/new/thread" className={addButtonClasses}>
                        <GroupIcon className="size-6 mx-auto" />
                        <p className="text-sm text-zinc-500">Thread</p>
                    </Navigate>
                    <Navigate comp="link" type="button" goto="/new/shelf" className={addButtonClasses}>
                        <ShelfIcon className="size-5 mx-auto" />
                        <p className="text-sm text-zinc-500">Shelf</p>
                    </Navigate>
                </div>
            </section>
        </BottomSheet>
    )

}

export const HomeNavbar = () => (
    <nav className={"fullScreen sticky z-3 top-0 p-2 border-b border-gray10 flex flex-cntr-between bg-primary"}>
        <div>
            <AppIcon className="size-6 overflow-visible md:hidden" />
            <h1 className="text-lg hidden md:inline">Parlocula</h1>
        </div>
        <div className="flex">
            <AddButton />

            <Navigate comp="link" className="p-2" goto="/notifications" >
                <NotificationButton />
            </Navigate>

            <Navigate comp="link" className="p-2" goto="/room" >
                <MessagesIcon />
            </Navigate>
        </div>
    </nav>
)

const tileButtonClassnames = "p-2 rounded-md border border-gray10 flex flex-cntr-between"

export const ThreadNavbar = () => (
    <TopNavbar heading="Threads">
        <div className="flex">

            <Navigate comp="link" className="p-2" goto="/new/thread" >
                <AddIcon />
            </Navigate>

            <BottomSheet className="p-2" button={<HamburgerIcon />}>
                <section className="px-2 space-y-2">
                    <Navigate comp="link" type="button" goto="/thread/joined" className={tileButtonClassnames}>
                        <div className="flex gap-2 items-center">
                            <GroupIcon />
                            <span>Joined Threads</span>
                        </div>
                        <RightChevron />
                    </Navigate>
                    <Navigate comp="link" type="button" goto="/thread/created" className={tileButtonClassnames}>
                        <div className="flex gap-2 items-center">
                            <AddIcon />
                            <span>Created Threads</span>
                        </div>
                        <RightChevron />
                    </Navigate>
                    <Navigate comp="link" type="button" goto="/thread/manages" className={tileButtonClassnames}>
                        <div className="flex gap-2 items-center">
                            <ShieldIcon />
                            <span>Managed Threads</span>
                        </div>
                        <RightChevron />
                    </Navigate>
                </section>
            </BottomSheet>
        </div>
    </TopNavbar>
)

export const ShelfNavbar = () => (
    <TopNavbar heading="Shelf">
        <div className="flex">

            <Navigate comp="link" className="p-2" goto="/new/shelf" >
                <AddIcon />
            </Navigate>

            <BottomSheet className="p-2" button={<HamburgerIcon />}>
                <section className="px-2 space-y-2">
                    <Navigate comp="link" type="button" goto="/shelf/all" className={tileButtonClassnames}>
                        <div className="flex gap-2 items-center">
                            <ShelfIcon />
                            <span>Your Shelves</span>
                        </div>
                        <RightChevron />
                    </Navigate>
                    <Navigate comp="link" type="button" goto="/shelf/public" className={tileButtonClassnames}>
                        <div className="flex gap-2 items-center">
                            <GlobeIcon />
                            <span>Your Public Shelves</span>
                        </div>
                        <RightChevron />
                    </Navigate>
                    <Navigate comp="link" type="button" goto="/shelf/private" className={tileButtonClassnames}>
                        <div className="flex gap-2 items-center">
                            <EyesIcon />
                            <span>Your Private Shelves</span>
                        </div>
                        <RightChevron />
                    </Navigate>
                    <Navigate comp="link" type="button" goto="/shelf/invited" className={tileButtonClassnames}>
                        <div className="flex gap-2 items-center">
                            <GroupIcon />
                            <span>Invited Shelves</span>
                        </div>
                        <RightChevron />
                    </Navigate>
                    <Navigate comp="link" type="button" goto="/shelf/collaborate" className={tileButtonClassnames}>
                        <div className="flex gap-2 items-center">
                            <CollaborateIcon />
                            <span>Collaborative Shelves</span>
                        </div>
                        <RightChevron />
                    </Navigate>
                </section>
            </BottomSheet>
        </div>
    </TopNavbar>
)

export const ProfileNavbar = ({ username }: { username: string }) => (
    <TopNavbar heading="Profile">
        <div className="flex">

            <AddButton />

            <ShareButton
                title={`Check out my profile on Parlocula - ${username}`}
                className="p-2"
            />

            <Navigate comp="link" className="p-2" goto="/settings" type="button">
                <HamburgerIcon />
            </Navigate>
        </div>
    </TopNavbar>
)