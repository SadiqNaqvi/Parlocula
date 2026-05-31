"use client";

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import OptionalChildren from "./OptionalChildren";

export const TabContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    return (
        <ul className={`flex gap-3 overflow-x-auto noScroll ${className}`}>{children}</ul>
    )
}

export const TabList = ({ children, className = "", href }: { children: React.ReactNode, href: string, className?: string }) => {

    const router = useRouter();
    const pathname = usePathname();

    const path = pathname.split('/').map(el => el.split('+')[0]).join('/');
    const active = path === href;

    const changeTab = (e: any) => {
        e.preventDefault();

        if (!active) router.replace(href);
    }

    return (
        <li className={twMerge("flex-1 w-[24%] min-w-fit px-2 *:py-2 border-b-2 border-transparent", active ? "border-secondary" : "border-gray30")}>
            <OptionalChildren
                condition={!active}
                fallback={(
                    <div className={twMerge("text-center cursor-not-allowed", className)}>{children}</div>
                )}
            >
                <Link href={href} onClick={changeTab} role="button" className={twMerge("w-full block text-center", className)}>{children}</Link>
            </OptionalChildren>
        </li>
    )
}