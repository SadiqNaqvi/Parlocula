"use client";

import { XmarkIcon } from "@assets/Icons";
import React, { RefObject } from "react";
import { Drawer } from "vaul";
import BottomSheet, { BottomSheetProps, BottomSheetRef } from "./BottomSheet";
import { OptionalChildren } from "./ui";

type Props = {
    ButtonElement?: React.ReactNode
    children: React.ReactNode,
    heading?: string;
    controls?: "auto" | "manual",
    sheetRef?: RefObject<BottomSheetRef | null>
} & BottomSheetProps

const OptionMenu = ({ children, heading, controls = "auto", ButtonElement, sheetRef, ...args }: Props) => (
    <BottomSheet ref={sheetRef} {...args} button={ButtonElement}>
        <section>
            <OptionalChildren condition={heading || controls === "manual"}>
                <div className="p-2 flex-cntr-between flex border-b border-gray30 mb-4">
                    <OptionalChildren condition={heading}>
                        <h6 className="parloHeading">{heading}</h6>
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