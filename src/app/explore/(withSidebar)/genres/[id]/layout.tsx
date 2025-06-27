import { Navbar } from "@components";
import { TabContainer, TabList } from "@components/ui/Tabs";
import { PropsWithChildren } from "react";

export default function Layout({ children, params }: Readonly<PropsWithChildren<{ params: { id: string } }>>) {

    const { id } = params;

    return (
        <>
            <Navbar navTitle={id.replaceAll('-', ' ')} />
            <TabContainer className="my-4">
                <TabList href={`/explore/genres/${id}/`}>Movies</TabList>
                <TabList href={`/explore/genres/${id}/shows`}>Shows</TabList>
            </TabContainer>
            {children}

        </>
    );
}