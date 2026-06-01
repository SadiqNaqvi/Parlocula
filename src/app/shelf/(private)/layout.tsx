import { Sidebar } from "@components";
import LoginModal from "@components/fallbacks/LoginModal";
import { getUserFromToken } from "@lib/auth/utils";
import generateDynamicMetadata from "@lib/seo/metadata";
import { cookies } from "next/headers";
import { PropsWithChildren } from "react";

export const metadata = generateDynamicMetadata({
    title: "Shelf",
    description: "Explore the collection of curated movies and shows collected by the die hard fans on Parlocula."
});

const ShelfHomeLayout = async ({ children }: PropsWithChildren) => {
    const user = await getUserFromToken(await cookies());

    if (!user) return (
        <LoginModal redirectTo="/shelf" title="Shelves" />
    )

    return (
        <>
            <Sidebar />
            <main>
                {children}
            </main>
        </>
    )

}

export default ShelfHomeLayout;