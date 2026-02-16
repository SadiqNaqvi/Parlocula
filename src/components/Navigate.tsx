"use client";

import { useNavigation } from "@store/historystack";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavigateType = {
    children: React.ReactNode;
    comp: "button" | "link";
    goto: string;
    preload?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>


const Navigate = ({ children, comp, goto, type, className, preload, ...args }: NavigateType) => {

    const navigator = useNavigation();
    const pathname = usePathname();

    const handleNavigation = (e: any) => {
        e.preventDefault();

        if (goto === pathname) return;

        else if (goto === "back") navigator.back();

        else navigator.goto(goto);
    }

    if (comp === "button") return (
        <button {...args} type="button" className={className} onClick={handleNavigation}>
            {children}
        </button>
    )

    else return (
        <Link
            prefetch={preload ?? false}
            href={goto}
            onClick={handleNavigation}
            className={className}
            {...args}
        >
            {children}
        </Link>
    );
}

export default Navigate;