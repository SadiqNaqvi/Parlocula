"use client";

import { Navigate } from "@components";
import useCurrentUser from "@store/user";
import { PropsWithChildren } from "react";

const Wrapper = ({ children }: PropsWithChildren) => (
    <aside className="preventScrolling fullScreen fixed z-2 overflow-hidden inset-0 flex flex-cntr-all backdrop-blur-md">
        <section className="mx-2 p-4 max-w-96 m-auto bg-primarylight rounded-md">
            {children}
        </section>
    </aside>
)

const ContentFiltered = ({ allow, redirectPath, filterContent }: { allow?: boolean, redirectPath: string, filterContent: boolean }) => {

    const { user, isHydrated } = useCurrentUser();

    if (!isHydrated) return null;

    else if (!user) return (
        <Wrapper>
            <h4 className="text-lg mb-2">Oops! The Parlocula Guards stopped you</h4>
            <p className="my-4 text-center">You need to log-in to view this</p>
            <div className="flex gap-2 mt-6">
                <Navigate
                    className="btn primary flex-1"
                    comp="link"
                    goto={`/join?url=${redirectPath}`}>
                    Log-in
                </Navigate>
                <Navigate
                    className="btn secondary flex-1"
                    comp="button"
                    goto="back">
                    Go Back
                </Navigate>
            </div>
        </Wrapper>
    )

    else if (!filterContent || allow) return null;

    return (
        <Wrapper>
            <h4 className="text-lg mb-2">Oops! The Parlocula Guards stopped you</h4>
            <div className="space-y-2 my-4">
                <p className="text-zinc-500">This content has been filtered out because it may contain explicit content.</p>
                <p className="text-zinc-500">You can either update settings or Go back.</p>
            </div>
            <div className="flex gap-2">
                <Navigate
                    className="btn primary flex-1"
                    comp="button"
                    goto="back">
                    Go Back
                </Navigate>
                <Navigate
                    className="btn secondary flex-1"
                    comp="link"
                    goto="/settings/filter_content">
                    Update Settings
                </Navigate>
            </div>
        </Wrapper>
    )
}

export default ContentFiltered;