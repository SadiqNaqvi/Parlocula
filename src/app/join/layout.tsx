import { getUserFromToken } from "@lib/auth/utils";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
    title: "Join - Parlocula",
    description: "Stop Searching Start Watching",
    keywords: "movies, tv shows, web series, movie recommendation, movie recommendation system, tv show recommendation system, movies suggestion, movie suggestion, show suggestion, series suggestion",
};

const AuthLayout = async ({ children }: PropsWithChildren) => {

    const user = await getUserFromToken(await cookies());
    if (user) redirect('/home');

    return (
        <main className="noPadding sm:flex h-full fullScreen overflow-hidden">
            <section className="px-4 sm:pr-0 sm:mt-4 relative z-[1] w-full sm:w-[340px] max-h-full noScroll overflow-y-auto">
                {children}
            </section>
            <section className="sm:m-4 sm:relative flex-1 w-full sm:w-auto sm:border border-gray30 sm:rounded-xl overflow-hidden">
                <div className="patternBackground"></div>
                <div className="relative z-[0] size-full md:rounded-xl flex flex-cntr-all">
                    <div className="hidden sm:inline">
                        <h1 className="text-4xl md:text-5xl uppercase text-center select-none">Parlocula</h1>
                        <p className="mt-2 text-center text-sm select-none">Where Stories Bring Us Together</p>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default AuthLayout;