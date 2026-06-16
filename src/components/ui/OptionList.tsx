"use client";

import { NestedSheet } from "@components/BottomSheet";
import Navigate from "@components/Navigate";
import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import { Drawer } from "vaul";
import OptionalChildren from "./OptionalChildren";

const defaultClassName = "px-2 py-3 capitalize hover:bg-zinc-500/10 active:bg-zinc-500/10 rounded-md transition-colors flex items-center justify-between gap-2 w-full";

export const NestedSheetTrigger = ({ children, button, className }: PropsWithChildren<{ button: React.ReactNode, className?: string }>) => {
    return (
        <li className={twMerge("w-full", className)}>
            <NestedSheet button={button} className={defaultClassName}>
                {children}
            </NestedSheet>
        </li>
    )
}

type Props = {
    onClick?: (...arg: any) => any;
    link?: string;
    children: React.ReactNode;
    className?: string;
    disable?: boolean;
    skipButtonWrapping?: boolean;
}

const OptionList = ({ onClick, children, link, className, disable, skipButtonWrapping }: Props) => {
    return (
        <li className={twMerge("w-full", disable ? "ghostColor" : '', className)}>
            <OptionalChildren condition={!disable || skipButtonWrapping} fallback={children}>
                <Drawer.Close disabled={disable} onClick={onClick} className={twMerge(defaultClassName, className)}>
                    <OptionalChildren condition={link} fallback={children}>
                        <Navigate comp="link" goto={link!}>{children}</Navigate>
                    </OptionalChildren>
                </Drawer.Close>
            </OptionalChildren>
        </li>
    )
}

export default OptionList;