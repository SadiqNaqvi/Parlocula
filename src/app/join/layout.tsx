import pattern from "@assets/logo_pattern.webp";
import type { Metadata } from "next";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
    title: "Join - Parlocula",
    description: "Stop Searching Start Watching",
    keywords: "movies, tv shows, web series, movie recommendation, movie recommendation system, tv show recommendation system, movies suggestion, movie suggestion, show suggestion, series suggestion",
};

const AuthLayout = ({ children }: PropsWithChildren) => {
    return (
        <main className="p-4 flex gap-6 h-full fullScreen overflow-hidden">
            <section className="mx-auto z-[1] w-80 max-h-full noScroll overflow-y-auto">
                {children}
            </section>
            <section className="md:flex-1 md:border border-gray30 md:rounded-xl">
                <div className="patternBackground"></div>
                <div className="relative z-[1] size-full md:rounded-xl md:flex md:flex-cntr-all">
                    <div className="hidden md:inline m-auto">
                        <h1 className="text-5xl uppercase text-center select-none">Parlocula</h1>
                        <p className="mt-2 text-center text-xl select-none">Stop Searching Start Watching</p>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default AuthLayout;