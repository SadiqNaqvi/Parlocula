import { Sidebar } from "@components";
import { LoadingSpinner } from "@components/ui";
import { Suspense } from "react";

export default function ExploreLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <>
            <Sidebar />
            <main>
                <Suspense fallback={<LoadingSpinner />}>
                    {children}
                </Suspense>
            </main>
        </>
    );
}