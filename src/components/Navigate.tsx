"use client";

import { useNavigation } from "@store/historystack";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NavigationSheet from "./sheets/NavigateSheet";
import { useRef } from "react";
import { BottomSheetRef } from "./BottomSheet";

type NavigateType = {
    children: React.ReactNode;
    comp: "button" | "link";
    goto: string;
    preload?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>


const Navigate = ({ children, comp, goto, type, className, preload, onContextMenu, ...args }: NavigateType) => {

    const navigator = useNavigation();
    const pathname = usePathname();
    const sheetRef = useRef<BottomSheetRef>(null);

    const handleNavigation = (e: any) => {
        e.preventDefault();

        if (goto === pathname) return;

        else if (goto === "back") navigator.back();

        else navigator.goto(goto);
    }

    const handleContextMenu = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        sheetRef.current?.open();
    }

    if (comp === "button") return (
        <>
            <NavigationSheet sheetRef={sheetRef} href={goto} />
            <button
                {...args}
                onContextMenu={onContextMenu ?? handleContextMenu}
                type="button"
                className={className}
                onClick={handleNavigation}
            >
                {children}
            </button>
        </>
    )

    else return (
        <>
            <NavigationSheet sheetRef={sheetRef} href={goto} />
            <Link
                {...args}
                prefetch={preload ?? false}
                href={goto}
                onClick={handleNavigation}
                onContextMenu={onContextMenu ?? handleContextMenu}
                className={className}
            >
                {children}
            </Link>
        </>
    );
}

export default Navigate;