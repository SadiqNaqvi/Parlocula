import { PropsWithChildren } from "react";
import PostHeader from "./PostHeader";
import { isValidObjectId } from "@lib/utils";
import { getPostById } from "@lib/helpers/common";
import { Metadata } from "next";

export const generateMetadata = async ({ params }: { params: { id: string } }): Promise<Metadata> => {
    const id = params.id.split('-')[0];
    if (!isValidObjectId(id)) return { title: "Popcorn Paragon" }
    const { result, success } = await getPostById(id);
    if (!success) return { title: "Popcorn Paragon" }
    const { title, username, body } = result;
    return {
        title: `${title.slice(0, 50)}${username ? " - Post by @" + username : ""} - Popcorn Paragon`,
        description: body
    }
}

export default function Layout({ children, params }: PropsWithChildren<{ params: { id: string } }>) {
    return (
        <main>
            <PostHeader id={params.id}>
                {children}
            </PostHeader>
        </main>
    )
}