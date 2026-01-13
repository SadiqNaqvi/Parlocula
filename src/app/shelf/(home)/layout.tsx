import { Sidebar } from "@components";
import LoginModal from "@components/fallbacks/LoginModal";
import { getUserFromToken } from "@lib/auth/utils";
import { cookies } from "next/headers";
import { PropsWithChildren } from "react";

export const generateMetadata = () => {
    return {
        title: "Shelves - Parlocula"
    }
}

const ShelfHomeLayout = async ({ children }: PropsWithChildren) => {
    const user = await getUserFromToken(await cookies());

    if (!user) return (
        <LoginModal redirectTo="/shelf" title="Shelves" />
    )

    return (
        <main>
            <Sidebar />
            {children}
        </main>
    )

}

export default ShelfHomeLayout;