"use client";

import { ShowError } from "@components/ui";

const GlobalErrorBoundary = ({ error, reset }: { error: Error; reset: () => void }) => {

    return (
        <html>
            <body>
                <main>
                    <ShowError
                        heading="Uh oh! Looks like we fell into an error hole"
                        fullScreen
                        retry={reset}
                    />
                </main>
            </body>
        </html>
    )


}

export default GlobalErrorBoundary;