import { Sidebar } from "@components";
import { getList } from "@lib/helpers/common";
import { isValidObjectId } from "@lib/utils";
import { Metadata } from "next";

export const generateMetadata = async ({ params }: { params: { id: string } }): Promise<Metadata> => {
    const { id } = params;
    const lid = id.split('-')[0];

    if (!isValidObjectId(lid)) return { title: "Popcorn Paragon" };
    const { success, result } = await getList(lid);
    if (!success) return { title: "Popcorn Paragon" };
    return {
        title: `${result.name} - list ${result.username ? `by @${result.username} ` : ""} - Popcorn Paragon`
    }
}

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {

    return (
        <main>
            {children}
        </main>
    )
}