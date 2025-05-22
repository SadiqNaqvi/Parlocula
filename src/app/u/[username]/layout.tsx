import { PropsWithChildren } from "react";
import Header from "./Header";
import { getUserByUsername } from "@lib/helpers/common";

export const generateMetadata = async ({ params: { username } }: { params: { username: string } }) => {
    const { result, success } = await getUserByUsername(username);
    if (!success || !result) return { title: "Popcorn Paragon" }
    return { title: `${username} - Popcorn Paragon`, description: result.bio }
}

const Layout = ({ children, params }: PropsWithChildren<{ params: { username: string } }>) => {
    return (
        <main>
            <Header username={params.username}>
                {children}
            </Header>
        </main>
    )
}

export default Layout;