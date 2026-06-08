"use client";

import { OptionalChildren } from "@components/ui";
import { usePathname, useRouter } from "next/navigation";

const LinkToast = ({ description, title, href }: { title: string, description?: string, href: string }) => {
    const navigation = useRouter();
    const pathname = usePathname();

    if (pathname === href)
        return title;


    return (
        <div className="p-2" onClick={() => navigation.push(href)}>
            <h4>{title}</h4>
            <OptionalChildren condition={description}>
                <p className="text-xs sm:text-sm ghostColor">{description}</p>
            </OptionalChildren>
        </div>
    )
}

export default LinkToast;