import { Sidebar } from "@components";
import generateDynamicMetadata from "@lib/seo/metadata";
import { PropsWithChildren } from "react";

export const metadata = generateDynamicMetadata({ title: "Threads" });

const ThreadHomeLayout = ({ children }: PropsWithChildren) => (
    <>
        <Sidebar />
        <main>
            {children}
        </main>
    </>
)

export default ThreadHomeLayout;