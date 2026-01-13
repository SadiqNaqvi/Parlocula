import { NotFound } from "@components/ui";
import { getUserFromToken } from "@lib/auth/utils";
import { getShelf } from "@lib/helpers/common";
import { isValidParloId } from "@lib/utils";
import { ParloPageProps } from "@type/other";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { PropsWithChildren } from "react";

export const generateMetadata = async ({ params, searchParams }: ParloPageProps): Promise<Metadata> => {

    const { id } = await params;
    const lid = id.split('-')[0];

    if (!isValidParloId(lid)) return { title: "Parlocula" };

    const user = await getUserFromToken(await cookies());
    const { k } = await searchParams;
    const { success, result } = await getShelf(lid, user?.user_id, k);
    if (!success) return { title: "Parlocula" };

    return {
        title: `${result.name} - Shelf ${result.username ? `by @${result.username} ` : ''} - Parlocula`
    }

}

const ShelfLayout = async ({ children, params }: PropsWithChildren<ParloPageProps>) => {

    const lid = (await params).id.split('-')[0];

    if (!isValidParloId(lid)) return (
        <NotFound
            title="Oops! Looks like you came across a wrong path."
            paras={["Shelf id is incorrect", "Please search the shelf by name in the explore page."]}
        />
    );

    return <main>{children}</main>
}

export default ShelfLayout;