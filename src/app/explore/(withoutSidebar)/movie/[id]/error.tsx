"use client";

import { ShowError } from "@components/ui";

export default function Error({ error, reset }: { error: any, reset: () => void }) {
    console.log(error);
    return (
        <ShowError
            heading="Oops! Looks like The Parlocula Explorers got into some trouble"
            errCode={error.message}
            retry={reset}
            fullScreen
        />
    )
}