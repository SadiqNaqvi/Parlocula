"use client";

import { ErrorFaceIcon } from "@assets/Icons";
import { convertCodeIntoError } from "@lib/utils";

const ShowError = ({ heading, errCode, messages = [], retry }: { heading: string, errCode: string, messages?: string[], retry?: () => any }) => {
    return (
        <section className="flex size-full flex-cntr-all">
            <div>
                <ErrorFaceIcon classnames="size-40 mx-auto" />
                <h4 className="text-3xl text-center my-4">{heading || "Oh ho! Error Encountered"}</h4>
                <p className="text-xl text-center my-4">{
                    convertCodeIntoError(errCode) as string || "Looks like an unknown error has occured! Please try again."
                }</p>
                {messages.map((msg, ind) => (
                    <p key={ind} className="text-zinc-500 text-sm text-center space-y-2">{msg}</p>
                ))}
                {retry && <button className="secondary mx-auto" onClick={retry}>Try again</button>}
            </div>
        </section>
    )
}

export default ShowError;