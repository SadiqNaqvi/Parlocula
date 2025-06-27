import { AddIcon } from "@assets/Icons";
import { Navigate, Sidebar } from "@components";
import { TabContainer, TabList } from "@components/ui/Tabs";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Threads - Popcorn Paragon",
    description: "Stop Searching Start Watching",
    keywords: "movies, tv shows, web series, movie recommendation, movie recommendation system, tv show recommendation system, movies suggestion, movie suggestion, show suggestion, series suggestion",
};

const ThreadHomeLayout = ({ children }: Readonly<{ children: React.ReactNode, }>) => {

    return (
        <>
            <Sidebar />
            <main>
                <header className="py-8">
                    <h1 className="text-6xl text-center uppercase font-semibold">Welcome to Threads</h1>
                    <p className="text-zinc-500 text-center mt-2">Explore the fandom of your favourite movies, shows, celebrities, characters and connect with the die hard fans.</p>
                </header>
                <section className="flex items-center">
                    <TabContainer className="my-4 w-full">
                        <TabList href="/t/joined">Joined</TabList>
                        <TabList href="/t">Popular</TabList>
                    </TabContainer>
                    <Navigate className="px-2 mx-2" comp="link" goto="/t/new" ><AddIcon /></Navigate>
                </section>
                {children}
            </main >
        </>
    )
}

export default ThreadHomeLayout;