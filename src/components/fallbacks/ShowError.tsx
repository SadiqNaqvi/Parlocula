"use client";

import { ErrorFaceIcon } from "@assets/Icons";
import Navbar from "@components/Navbar";
import { OptionalChildren } from "@components/ui";
import { codetoError } from "@lib/utils";
import { ErrorCodes } from "@type/other";
import { twMerge } from "tailwind-merge";

type Props = {
    heading: string,
    retry?: () => any
    messages?: string[]
    errCode?: ErrorCodes,
    fullScreen?: boolean,
    className?: string;
}

const ShowError = ({ heading, errCode, messages = [], retry, fullScreen, className }: Props) => {
    return (
        <>
            <OptionalChildren condition={fullScreen}>
                <Navbar />
            </OptionalChildren>
            <section className={twMerge(`${fullScreen ? "size-screen flex flex-cntr-all" : "forceCenter"} flex-col gap-3`, className)}>

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
        </>
    )
}

export default ShowError;