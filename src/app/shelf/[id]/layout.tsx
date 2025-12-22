import { NotFound } from "@components/ui";
import { getUserFromToken } from "@lib/auth/utils";
import { getShelf } from "@lib/helpers/common";
import { isValidParloId } from "@lib/utils";
import { Metadata } from "next";
import { cookies } from "next/headers";

export const generateMetadata = async ({ params, searchParams }: { params: { id: string }, searchParams?: { k?: string } }): Promise<Metadata> => {

    const { id } = params;
    const lid = id.split('-')[0];

    if (!isValidParloId(lid)) return { title: "Parlocula" };

    const user = await getUserFromToken(cookies());

    const { success, result } = await getShelf(lid, user?.user_id, searchParams?.k);
    if (!success) return { title: "Parlocula" };

    return {
        title: `${result.name} - Shelf ${result.username ? `by @${result.username} ` : ''} - Parlocula`
    }

}

const ShelfLayout = ({ children, params: { id } }: Readonly<{ children: React.ReactNode, params: { id: string } }>) => {

    const lid = id.split('-')[0];

    if (!isValidParloId(lid)) return (
        <NotFound
            title="Oops! Looks like you came across a wrong path."
            paras={["Shelf id is incorrect", "Please search the shelf by name in the explore page."]}
        />
    );

    return <main>{children}</main>
}

export default ShelfLayout;