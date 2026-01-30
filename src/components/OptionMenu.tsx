"use client";

import { XmarkIcon } from "@assets/Icons";
import React, { RefObject } from "react";
import { Drawer } from "vaul";
import BottomSheet, { BottomSheetRef } from "./BottomSheet";
import { OptionalChildren } from "./ui";

type Props = {
    ButtonElement: React.ReactNode
    children: React.ReactNode,
    heading?: string;
    controls?: "auto" | "manual",
    sheetRef?: RefObject<BottomSheetRef | null>
} & React.HTMLAttributes<HTMLButtonElement>

const OptionMenu = ({ children, heading, controls = "auto", ButtonElement, sheetRef, ...args }: Props) => (
    <BottomSheet ref={sheetRef} {...args} button={ButtonElement}>
        <section>
            <OptionalChildren condition={heading || controls === "manual"}>
                <div className="py-4 px-4 flex-cntr-between flex border-b border-gray30">
                    <OptionalChildren condition={heading}>
                        <span className="text-xl">{heading}</span>
                    </OptionalChildren>
                    <OptionalChildren condition={controls === "manual"}>
                        <Drawer.Close type="button" className="iconBtn ml-auto">
                            <XmarkIcon />
                        </Drawer.Close>
                    </OptionalChildren>
                </div>
            </OptionalChildren>
            <ul>{children}</ul>
        </section>
    </BottomSheet>
)

export default OptionMenu;