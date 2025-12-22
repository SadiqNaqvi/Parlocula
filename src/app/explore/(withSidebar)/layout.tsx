import { Sidebar } from "@components";
import { FullPageLoadingSpinner } from "@components/ui/loading/LoadingSpinner";
import { Suspense } from "react";

export default function ExploreLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <>
            <Sidebar />
            <main>
                <Suspense fallback={<FullPageLoadingSpinner />}>
                    {children}
                </Suspense>
            </main>
        </>
    );
}