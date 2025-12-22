import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Threads - Parlocula",
    description: "Stop Searching Start Watching",
    keywords: "movies, tv shows, web series, movie recommendation, movie recommendation system, tv show recommendation system, movies suggestion, movie suggestion, show suggestion, series suggestion",
};

const ThreadHomeLayout = ({ children }: Readonly<{ children: React.ReactNode, }>) => {

    return (
        <main>{children}</main>
    )
}

export default ThreadHomeLayout;