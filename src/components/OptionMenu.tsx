"use client";

import { XmarkIcon } from "@assets/Icons";
import React from "react";
import Modal from "./Modal";

type Props = {
    ButtonElement: React.ReactNode
    children: React.ReactNode,
    id: string,
    heading?: string;
    controls?: "auto" | "manual",
} & React.HTMLAttributes<HTMLButtonElement>

const OptionMenu = ({ children, id, heading, controls = "auto", ButtonElement, ...args }: Props) => (
    <Modal {...args} buttonChildren={ButtonElement} id={id}>
        <section id="optionMenu" className="bg-primarylight w-[600px] max-w-full sm:mx-2 h-fit min-h-40 rounded-lg">
            <div className="py-4 px-4 flex-cntr-between flex border-b border-gray30">
                {heading && <span className="text-xl">{heading}</span>}
                {controls === "manual" &&
                    <button data-fancybox-close className="iconBtn ml-auto">
                        <XmarkIcon />
                    </button>
                }
            </div>
            <ul className="max-h-[95dvh] pb-6 overflow-y-auto">{children}</ul>
        </section>
    </Modal>
)

export default OptionMenu;