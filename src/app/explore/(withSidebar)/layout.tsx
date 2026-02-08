import { Sidebar } from "@components";
import { FullPageLoadingSpinner } from "@components/ui/loading/LoadingSpinner";
import { PropsWithChildren, Suspense } from "react";

export default function ExploreLayout({ children }: PropsWithChildren) {
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