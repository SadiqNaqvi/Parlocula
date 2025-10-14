"use client";

import { XmarkIcon } from "@assets/Icons";
import React from "react";
import { Drawer } from "vaul";
import BottomSheetTrigger from "./BottomSheet";

type Props = {
    ButtonElement: React.ReactNode
    children: React.ReactNode,
    heading?: string;
    controls?: "auto" | "manual",
} & React.HTMLAttributes<HTMLButtonElement>

const OptionMenu = ({ children, heading, controls = "auto", ButtonElement, ...args }: Props) => (
    <BottomSheetTrigger {...args} button={ButtonElement}>
        <section className="bg-primarylight w-[600px] max-w-full sm:mx-2 h-fit min-h-40 rounded-lg">
            <div className="py-4 px-4 flex-cntr-between flex border-b border-gray30">
                {heading && <span className="text-xl">{heading}</span>}
                {controls === "manual" && (
                    <Drawer.Close type="button" className="iconBtn ml-auto">
                        <XmarkIcon />
                    </Drawer.Close>
                )}
            </div>
            <ul className="pb-6 overflow-y-auto">{children}</ul>
        </section>
    </BottomSheetTrigger>
)

export default OptionMenu;