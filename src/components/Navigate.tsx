"use client";

import { useHistoryStack } from "@store/historystack";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

type NavigateType = {
    children: React.ReactNode;
    comp: "button" | "link";
    goto: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement> & React.AnchorHTMLAttributes<HTMLAnchorElement>


const Navigate = ({ children, comp, goto, ...args }: NavigateType) => {

    const { historyStack, lastPage, popHistory, pushHistory } = useHistoryStack();
    const router = useRouter();
    const pathname = usePathname();

    const handleNavigation = () => {
        if (goto !== "back") {
            if (!historyStack.length) pushHistory(pathname);
            pushHistory(goto);
            comp === "button" && router.push(goto);
            return
        };
        if (historyStack.length) popHistory();
        router.replace(lastPage && lastPage !== pathname ? lastPage : '/home');
    }

    return (
        <>
            {comp === "button" ?
                <button {...args} onClick={handleNavigation}>{children}</button>
                :
                <Link {...args} href={goto} onClick={handleNavigation}>{children}</Link>
            }
        </>
    )
}

export default Navigate;