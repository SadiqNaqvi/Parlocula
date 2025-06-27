"use client";

import { LeftChevron, RightChevron, UserIcon } from "@assets/Icons";
import { Navigate } from "@components";
import { LoadingSpinner } from "@components/ui";
import { getPoster } from "@lib/utils";
import useCurrentUser from "@store/user";
import Image from "next/image";
import { PropsWithChildren } from "react";

const ListContainer = ({ children, href }: PropsWithChildren<{ href?: string }>) => (
    <li className="px-2 *:py-3 border-b last:border-0 border-gray40">
        {href ?
            <Navigate comp="link" goto={href} className="size-full flex flex-cntr-between">
                {children}
                <RightChevron className="size-4" />
            </Navigate>
            :
            <div>{children}</div>
        }
    </li>
)

const Sections = ({ heading, children }: PropsWithChildren<{ heading: string }>) => (
    <section className="rounded-md">
        <h2 className="uppercase text-sm text-semibold p-2">{heading}</h2>
        <ul className="bg-primarylight">{children}</ul>
    </section>
)

const Page = () => {
    const { user, isHydrated } = useCurrentUser();

    if (!isHydrated) return <LoadingSpinner />

    if (!user) return (
        <section className="stretchContainer flex-col">
            <div className="mb-4">
                <UserIcon className="size-12" />
            </div>
            <div>
                <h2 className="text-2xl">Hello Guest 👋</h2>
                <p className="mt-2 mb-4 text-sm">You need to log-in to see your stuff here.</p>
                <Navigate comp="button" goto="/join" className="primary btn">Log in</Navigate>
            </div>
        </section>
    )

    return (
        <>
            <header className="flex items-center gap-3 sticky top-0 bg-primay py-4 px-2 border-b border-gray40">
                <Navigate comp="button" goto="back">
                    <LeftChevron />
                </Navigate>
                <h1 className="text-lg">Settings</h1>
            </header>
            <Sections heading="profile">
                <ListContainer href={`/u/${user.username}`}>
                    <div className="flex gap-2 items-center">
                        {user.profile ?
                            <Image src={getPoster({ path: user.profile })} width={24} height={24} className="size-6 object-cover rounded-full" alt="" />
                            :
                            <div className="size-8 p-[0.3rem] flex rounded-full border-1 border-zinc-500">
                                <UserIcon className="size-full m-auto" />
                            </div>
                        }
                        <span>View Profile</span>
                    </div>
                </ListContainer>
                <ListContainer href="edit/username">{user.username}</ListContainer>
                <ListContainer href="edit/email">
                    <p className="line-clamp-1">{user.email}</p>
                </ListContainer>
                <ListContainer href="me/saved">Saved Posts</ListContainer>
                <ListContainer href="me/saved/comments">Saved Comments</ListContainer>
                <ListContainer href="me/saved/lists">Saved Lists</ListContainer>

                {/* <ListContainer href="/setting/notification">Notifications</ListContainer> */}
            </Sections>
            <Sections heading="">

            </Sections>
        </>
    )
}

export default Page;