"use client";

import { Button } from "@components/ui";

export default function Error({ error, reset }: { error: Error, reset: () => void }) {

    return (
        <main className="h-dvh flex flex-cntr-all">
            <section className="space-y-4">
                <h2 className="text-2xl">Oops! Something went wrong. Please try again.</h2>
                <p className="mt-2">{error.message.toString()}</p>
                <Button
                    title="Try Again"
                    id="try-again-button"
                    className="secondary mx-auto"
                    onClick={() => reset()}
                >
                    Try again
                </Button>
            </section>
        </main>
    )
}