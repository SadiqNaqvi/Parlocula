import pattern from "@assets/logo_pattern.webp";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Join - Popcorn Paragon",
    description: "Stop Searching Start Watching",
    keywords: "movies, tv shows, web series, movie recommendation, movie recommendation system, tv show recommendation system, movies suggestion, movie suggestion, show suggestion, series suggestion",
};

const AuthLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    return (
        <main className="p-4 flex gap-6 h-full noPadding overflow-hidden">
            <section className="mx-auto z-[1] w-80 max-h-full noScroll overflow-y-auto">
                {children}
            </section>
            <section className="absolute inset-0 md:static md:flex-1 md:border border-gray30 background-all md:rounded-xl" style={{ backgroundImage: `url(${pattern.src})` }}>
                <div className="backdrop-brightness-[15%] md:backdrop-brightness-[20%] size-full md:rounded-xl md:flex md:flex-cntr-all">
                    <div className="hidden md:inline m-auto">
                        <h1 className="text-5xl uppercase text-center select-none">Popcorn Paragon</h1>
                        <p className="mt-2 text-center text-xl select-none">Stop Searching Start Watching</p>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default AuthLayout;