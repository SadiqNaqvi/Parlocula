"use client";

import { XmarkIcon } from "@assets/Icons";
import React, { RefObject } from "react";
import { Drawer } from "vaul";
import BottomSheet, { BottomSheetRef } from "./BottomSheet";

type Props = {
    ButtonElement: React.ReactNode
    children: React.ReactNode,
    heading?: string;
    controls?: "auto" | "manual",
    sheetRef?: RefObject<BottomSheetRef | null>
} & React.HTMLAttributes<HTMLButtonElement>

const OptionMenu = ({ children, heading, controls = "auto", ButtonElement, sheetRef, ...args }: Props) => (
    <BottomSheet ref={sheetRef} {...args} button={ButtonElement}>
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
    </BottomSheet>
)

export default OptionMenu;