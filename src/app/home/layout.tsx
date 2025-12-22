import { Sidebar } from "@components";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Home - Parlocula",
    description: "Stop Searching Start Watching",
    keywords: "movies, tv shows, web series, movie recommendation, movie recommendation system, tv show recommendation system, movies suggestion, movie suggestion, show suggestion, series suggestion",
};

export default function HomeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <div className="flex">
            <Sidebar />
            <main>
                {children}
            </main>
        </div>
    )
}