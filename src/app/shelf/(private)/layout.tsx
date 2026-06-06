import LoginModal from "@components/fallbacks/LoginModal";
import { getUserFromToken } from "@lib/auth/utils";
import { cookies } from "next/headers";
import { PropsWithChildren } from "react";

const ShelfAuthLayout = async ({ children }: PropsWithChildren) => {
    const user = await getUserFromToken(await cookies());

    if (!user) return (
        <LoginModal redirectTo="/shelf" title="Shelves" />
    )

    return children;

}

export default ShelfAuthLayout;