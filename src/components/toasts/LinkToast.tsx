"use client";

import { OptionalChildren } from "@components/ui";
import { useNavigation } from "@store/historystack";
import { usePathname } from "next/navigation";

const LinkToast = ({ description, title, href }: { title: string, description?: string, href: string }) => {
    const navigation = useNavigation();
    const pathname = usePathname();

    if (pathname === href)
        return title;


    return (
        <div className="p-2" onClick={() => navigation.goto(href)}>
            <h4>{title}</h4>
            <OptionalChildren condition={description}>
                <p className="text-xs sm:text-sm text-zinc-500">{description}</p>
            </OptionalChildren>
        </div>
    )
}

export default LinkToast;