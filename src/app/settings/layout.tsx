import LoginModal from "@components/fallbacks/LoginModal";
import { getUserFromToken } from "@lib/auth/utils";
import type { Metadata } from "next";
import { cookies } from "next/headers";

export const metadata: Metadata = {
    title: "Settings - Parlocula",
    description: "Stop Searching Start Watching",
    keywords: "movies, tv shows, web series, movie recommendation, movie recommendation system, tv show recommendation system, movies suggestion, movie suggestion, show suggestion, series suggestion",
};

const SettingsLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {

    const user = getUserFromToken(cookies());

    if (!user) return (
        <LoginModal redirectTo="/settings" />
    )

    return (
        <main>
            {children}
        </main>
    )
}

export default SettingsLayout;