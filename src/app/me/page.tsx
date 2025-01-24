"use client";

import { UserIcon } from "@assets/Icons";
import { Navigate } from "@components";
import useCurrentUser from "@store/user";
import { UserProfile } from "@components/ui";

const Page = () => {
    const { user } = useCurrentUser();

    if (!user) return (
        <>
            <header className="flex gap-6 py-12 border-b border-gray40">
                <div className="w-32">
                    <UserIcon classnames="size-full" />
                </div>
                <div className="space-y-4">
                    <h2 className="text-2xl">Guest (Anonymous)</h2>
                    <Navigate comp="button" goto="/join" className="primary">Join Popcorn Paragon</Navigate>
                </div>
            </header>
            <section className="py-12 space-y-4">
                <h3 className="text-4xl text-center">Nothing to see here.</h3>
                <p className="text-zinc-500 text-center">Join Popcorn Paragon and use the app your way.</p>
            </section>
        </>
    )

    return <UserProfile user={user} isCurrentUser />
}

export default Page;