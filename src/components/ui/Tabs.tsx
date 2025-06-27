"use client";

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation";

export const TabContainer = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    return (
        <ul className={`flex gap-3 overflow-x-auto noScroll ${className}`}>{children}</ul>
    )
}

export const TabList = ({ children, className = "", href, isActive }: { children: React.ReactNode, isActive?: boolean, href: string, className?: string }) => {

    const router = useRouter();
    const pathname = usePathname();
    const changeTab = (e: any) => {
        e.preventDefault();
        router.replace(href);
    }

    const active = pathname.includes(href);

    return (
        <li className={`flex-1 min-w-[24%] *:py-2 border-b-2 border-transparent ${active ? "border-secondary" : "border-gray30"} ${className}`}>
            {active ?
                <p className="text-center cursor-not-allowed">{children}</p>
                :
                <Link href={href} onClick={changeTab} role="button" className="w-full block text-center" >{children}</Link>
            }
        </li>
    )
}