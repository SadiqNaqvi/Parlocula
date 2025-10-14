import { NotFound } from "@components/ui";
import { getUserFromToken } from "@lib/auth/utils";
import { getList } from "@lib/helpers/common";
import { isValidObjectId } from "@lib/utils";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const generateMetadata = async ({ params, searchParams: { k } }: { params: { id: string }, searchParams: { k?: string } }): Promise<Metadata> => {
    const { id } = params;
    const lid = id.split('-')[0];

    if (!isValidObjectId(lid)) return { title: "Popcorn Paragon" };
    const user = await getUserFromToken(cookies());

    const { success, result } = await getList(lid, user?.user_id ?? "undefined", k);
    if (!success) return { title: "Popcorn Paragon" };
    return {
        title: `${result.name} - list ${result.username ? `by @${result.username} ` : ""} - Popcorn Paragon`
    }
}

export default function Layout({ children, params: { id } }: Readonly<{ children: React.ReactNode, params: { id: string } }>) {

    const lid = id.split('-')[0];
    if (lid && !isValidObjectId(lid)) return (
        <NotFound
            title="Oops! Looks like you came across a wrong path."
            paras={["List id is incorrect", "Please search the list by name in the explore page."]}
        />
    );

    return <main>{children}</main>
}