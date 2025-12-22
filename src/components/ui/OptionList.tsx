"use client";

import { NestedSheet } from "@components/BottomSheet";
import Navigate from "@components/Navigate";
import { PropsWithChildren } from "react";
import { Drawer } from "vaul";

const defaultClassName = "py-2 px-4 capitalize hover:bg-zinc-500 hover:bg-opacity-20 transition-colors flex flex-cntr-between w-full";

export const NestedSheetTrigger = ({ children, button, className }: PropsWithChildren<{ button: React.ReactNode, className?: string }>) => {
    return (
        <li className={`${className} border-b border-gray30 w-full`}>
            <NestedSheet button={button} className={defaultClassName}>
                {children}
            </NestedSheet>
        </li>
    )
}

const OptionList = ({ onClick, children, link, className = "" }: { onClick?: (...arg: any) => any, link?: string, children: React.ReactNode, className?: string }) => {
    return (
        <li className={`${className} border-b last:border-b-0 border-gray30 w-full`}>
            <Drawer.Close
                onClick={onClick}
                className={defaultClassName}>
                {link ?
                    (
                        <Navigate comp="link" goto={link}>{children}</Navigate>
                    )
                    :
                    children
                }
            </Drawer.Close>
        </li>
    )
}

export default OptionList;