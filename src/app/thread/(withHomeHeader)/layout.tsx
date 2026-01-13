import { Sidebar } from "@components";
import { TabContainer, TabList } from "@components/ui/Tabs";
import type { Metadata } from "next";
import { PropsWithChildren } from "react";

export const metadata: Metadata = {
    title: "Threads - Parlocula",
    description: "Stop Searching Start Watching",
};

const ThreadHomeLayout = ({ children }: PropsWithChildren) => (
    <>
        <Sidebar />
        <main>
            <header className="py-8">
                <h1 className="text-6xl text-center uppercase font-semibold">Welcome to Threads</h1>
                <p className="text-zinc-500 text-center mt-2">Explore the fandom of your favourite movies, shows, celebrities, characters and connect with the die hard fans.</p>
            </header>
            <TabContainer className="my-4 w-full">
                <TabList href="/thread">Popular</TabList>
                <TabList href="/thread/created">Created</TabList>
                <TabList href="/thread/manages">Manages</TabList>
                <TabList href="/thread/joined">Joined</TabList>
            </TabContainer>
            {children}
        </main>
    </>
)

export default ThreadHomeLayout;