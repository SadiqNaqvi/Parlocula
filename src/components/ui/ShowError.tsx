"use client";

import { ErrorFaceIcon } from "@assets/Icons";
import { codetoError } from "@lib/utils";

type Props = {
    heading: string,
    retry?: () => any
    messages?: string[]
    errCode?: string,
}

const ShowError = ({ heading, errCode, messages = [], retry }: Props) => {
    return (
        <section className="forceCenter flex-col gap-3">

            <ErrorFaceIcon className="size-40 mx-auto" />

            <h4 className="text-xl text-center">{heading || "Oh ho! Error Encountered"}</h4>

            {errCode &&
                <p className="text-sm text-zinc-500 text-center">{codetoError(errCode) as string}</p>
            }

            {messages.map((msg, ind) => (
                <p key={ind} className="text-xs text-zinc-500 text-center space-y-2">{msg}</p>
            ))}

            {retry && <button className="secondary mx-auto" onClick={retry}>Try again</button>}
        </section>
    )
}

export default ShowError;