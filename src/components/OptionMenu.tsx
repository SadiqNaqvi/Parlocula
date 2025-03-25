"use client";

import { XmarkIcon } from "@assets/Icons";
import React, { ReactElement, useState } from "react";

type Props = {
    children: React.ReactNode,
    heading?: string;
    controls: "auto" | "manual",
    className?: string,
    ButtonElement: ReactElement
}
export default function OptionMenu({ children, heading, controls, className, ButtonElement }: Props) {
    const [isOpened, setIsOpened] = useState(false);

    const toggle = () => {
        setIsOpened(!isOpened);
    }

    return <>
        <button className={className} onClick={toggle}>
            {ButtonElement}
        </button>
        {isOpened &&
            <aside className="fixed inset-0 backdrop-brightness-[0.25] z-[20] flex justify-center items-end md:items-center" onClick={toggle}>
                <section className="bg-primarylight w-full max-w-lg sm:mx-2 h-fit min-h-40 rounded-lg" onClick={e => e.stopPropagation()}>
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
            </aside>
        }
    </>
}