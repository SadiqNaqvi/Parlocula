"use client";

import { ShowError } from "@components/fallbacks";

export default function Error({ error, reset }: { error: any, reset: () => void }) {
    console.warn(error);
    return (
        <ShowError
            heading="Oops! Looks like The Parlocula Explorers got into some trouble"
            errCode={error.message}
            retry={reset}
            fullScreen
        />
    )
}