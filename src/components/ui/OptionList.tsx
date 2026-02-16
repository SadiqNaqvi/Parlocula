"use client";

import { NestedSheet } from "@components/BottomSheet";
import Navigate from "@components/Navigate";
import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import { Drawer } from "vaul";
import OptionalChildren from "./OptionalChildren";

const defaultClassName = "p-2 capitalize hover:bg-zinc-500 hover:bg-opacity-20 transition-colors flex flex-cntr-between w-full";

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
}

const OptionList = ({ onClick, children, link, className, disable }: Props) => {
    return (
        <li className={twMerge("w-full", disable ? "text-zinc-500" : '', className)}>
            <OptionalChildren condition={!disable} fallback="children">
                <Drawer.Close disabled={disable} onClick={onClick} className={defaultClassName}>
                    <OptionalChildren condition={link} fallback={children}>
                        <Navigate comp="link" goto={link || ''}>{children}</Navigate>
                    </OptionalChildren>
                </Drawer.Close>
            </OptionalChildren>
        </li>
    )
}

export default OptionList;