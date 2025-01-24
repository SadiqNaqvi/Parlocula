"use client";

import { ErrorFaceIcon } from "@assets/Icons";

const ShowError = ({ heading, paras }: { heading: string, paras: string[] }) => {
    return (
        <section className="flex size-full flex-cntr-all">
            <div className="">
                <ErrorFaceIcon classnames="size-40 mx-auto" />
                <h4 className="text-3xl text-center my-4">{heading || "Error Encountered"}</h4>
                {paras.map((para, ind) => (
                    <p key={ind} className="text-zinc-500 text-center space-y-2">{para}</p>
                ))}
            </div>
        </section>
    )
}

export default ShowError;