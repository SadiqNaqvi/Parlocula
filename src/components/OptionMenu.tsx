"use client";

import { XmarkIcon } from "@assets/Icons";
import React, { ReactElement, useRef } from "react";

export default function OptionMenu({ children, heading, controls, place, className, ButtonElement }: { children: React.ReactNode, heading?: string; controls: "auto" | "manual", className?: string, ButtonElement: ReactElement, place: "center" | "end" }) {
    const dialogRef = useRef<HTMLDialogElement | null>(null)

    const toggle = () => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        dialog.open ? dialog.close() : dialog.showModal()

    }

    return <>
        <button className={className} onClick={toggle}>
            {ButtonElement}
        </button>
        <dialog ref={dialogRef} className="fullControl" onClick={toggle}>
            <div className={`size-full flex items-${place}`}>
                <section className="bg-primarylight w-full md:mx-2 h-fit min-h-60 rounded-lg" onClick={e => e.stopPropagation()}>
                    <div className="py-4 px-4 flex-cntr-between flex border-b border-gray30">
                        {heading &&
                            <span className="text-xl">{heading}</span>
                        }
                        {controls === "manual" &&
                            <button className="iconBtn ml-auto" onClick={toggle}>
                                <XmarkIcon />
                            </button>
                        }
                    </div>
                    {React.createElement('ul', { className: "max-h-[99dvh] pb-6 overflow-y-auto", onClick: toggle, children: children })}
                    {/* <div className="max-h-[99dvh] pb-6 overflow-y-auto" onClick={toggle}>
                        {children}
                    </div> */}
                </section>
            </div>
        </dialog>
    </>
}