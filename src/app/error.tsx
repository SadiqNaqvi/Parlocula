"use client";

import { ShowError } from "@components/ui";
import { Metadata } from "next"
import "@/app/globals.css";
import { Sidebar } from "@components";

export const metadata: Metadata = {
    title: "Uh Oh! | Parlocula",
}

const GlobalErrorBoundary = ({ error, reset }: { error: Error; reset: () => void }) => {

    return (
        // <html>
        //     <body>
        <>
            <Sidebar />
            <main className="noPadding flex">
                <ShowError
                    className="px-2 sm:px-0"
                    heading="Uh oh! The Parlocula Explorers got into trouble"
                    retry={reset}
                />
            </main>
        </>
        //     </body>
        // </html>
    )


}

export default GlobalErrorBoundary;