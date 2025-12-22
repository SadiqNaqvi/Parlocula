import { LoadingSpinner } from "@components/ui";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Create Post - Parlocula",
    description: "Stop Searching Start Watching",
    keywords: "movies, tv shows, web series, movie recommendation, movie recommendation system, tv show recommendation system, movies suggestion, movie suggestion, show suggestion, series suggestion",
};

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {

    return (
        <main>
            <Suspense fallback={<LoadingSpinner />}>
                {children}
            </Suspense>
        </main>
    )
}