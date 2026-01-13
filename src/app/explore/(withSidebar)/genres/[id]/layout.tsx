import { Navbar } from "@components";
import { TabContainer, TabList } from "@components/ui/Tabs";
import { ParloPageProps } from "@type/other";
import { PropsWithChildren } from "react";

export default async function Layout({ children, params }: PropsWithChildren<ParloPageProps>) {

    const { id } = await params;

    return (
        <>
            <Navbar className="capitalize bg-primary" navTitle={id.replaceAll('-', ' ')} />
            <TabContainer className="my-4">
                <TabList href={`/explore/genres/${id}`}>Movies</TabList>
                <TabList href={`/explore/genres/${id}/shows`}>Shows</TabList>
            </TabContainer>
            {children}
        </>
    );
}