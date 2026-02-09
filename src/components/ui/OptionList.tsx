"use client";

import { NestedSheet } from "@components/BottomSheet";
import Navigate from "@components/Navigate";
import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import { Drawer } from "vaul";
import OptionalChildren from "./OptionalChildren";

const defaultClassName = "py-2 px-4 capitalize hover:bg-zinc-500 hover:bg-opacity-20 transition-colors flex flex-cntr-between w-full";

export const NestedSheetTrigger = ({ children, button, className }: PropsWithChildren<{ button: React.ReactNode, className?: string }>) => {
    return (
        <li className={twMerge("w-full p-2", className)}>
            <NestedSheet button={button} className={defaultClassName}>
                {children}
            </NestedSheet>
        </li>
    )
}

const OptionList = ({ onClick, children, link, className = "" }: { onClick?: (...arg: any) => any, link?: string, children: React.ReactNode, className?: string }) => {
    return (
        <li className={twMerge("w-full p-2", className)}>
            <Drawer.Close
                onClick={onClick}
                className={defaultClassName}>
                <OptionalChildren condition={link} fallback={children}>
                    <Navigate comp="link" goto={link||''}>{children}</Navigate>
                </OptionalChildren>
            </Drawer.Close>
        </li>
    )
}

export default OptionList;