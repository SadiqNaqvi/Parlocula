"use client";

import { Sidebar } from "@components";
import { ShowError } from "@components/fallbacks";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Uh Oh! | Parlocula",
}

const GlobalErrorBoundary = ({ error, reset }: { error: Error; reset: () => void }) => {

    return (
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
    )


}

export default GlobalErrorBoundary;