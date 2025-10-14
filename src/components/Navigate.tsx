"use client";

import { useHistoryStack } from "@store/historystack";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

type NavigateType = {
    children: React.ReactNode;
    comp: "button" | "link";
    goto: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>


const Navigate = ({ children, comp, goto, type, className, ...args }: NavigateType) => {

    const { historyStack, lastPage, popHistory, pushHistory } = useHistoryStack();
    const router = useRouter();
    const pathname = usePathname();

    const handleNavigation = () => {
        if (goto === "back") {
            historyStack.length && popHistory();
            router.replace(lastPage && lastPage !== pathname ? lastPage : '/home');
        } else {
            if (!historyStack.length)
                pushHistory(pathname);
            pushHistory(goto);
            comp === "button" && router.push(goto);
        }
    }

    return (
        <>
            {comp === "button" ? (
                <button
                    {...args}
                    type="button"
                    className={className}
                    onClick={handleNavigation}
                >
                    {children}
                </button>
            ) : (
                <Link {...args}
                    href={goto}
                    onClick={handleNavigation}
                    className={(className || '') + (type === "button" ? " no-underline btn" : '')}
                >
                    {children}
                </Link >
            )
            }
        </>
    )
}

export default Navigate;