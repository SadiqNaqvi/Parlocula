"use client";

import { LeftChevron } from "@assets/Icons";
import { Navigate } from "@components";
import { TabContainer, TabList } from "@components/ui/Tabs";
import { usePathname } from "next/navigation";
import { PropsWithChildren } from "react";

export default function Layout({ children, params }: Readonly<PropsWithChildren<{ params: { id: string } }>>) {

    const { id } = params;
    const pathname = usePathname();
    const segment = pathname.split('/').at(-1);
    const currentTab = segment === "shows" ? segment : "movies";

    return (
        <>
            <header className="flex items-center gap-4">
                <Navigate comp="button" goto="back" className="iconBtn">
                    <LeftChevron />
                </Navigate>
                <h1 className="text-3xl uppercase font-semibold">{id.replaceAll('-', ' ')}</h1>
            </header>
            <TabContainer>
                <TabList href={`/explore/genres/${id}/`} isActive={currentTab === "movies"}>Movies</TabList>
                <TabList href={`/explore/genres/${id}/shows`} isActive={currentTab === "shows"}>Shows</TabList>
            </TabContainer>
            {children}

        </>
    );
}