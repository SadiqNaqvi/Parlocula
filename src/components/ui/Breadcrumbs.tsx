import { RightChevron } from "@assets/Icons";
import Navigate from "@components/Navigate";
import { TypedFunction } from "@type/other";
import { PropsWithChildren } from "react";

const BreadCrumb = ({ children }: PropsWithChildren) => (
    <div className="text-sm flex gap-2 items-center hover:underline">
        <strong>{children}</strong>
        <RightChevron className="size-4 group-last:rotate-90" />
    </div>
)

export const BreadCrumbTile = ({ children, href, onClick }: PropsWithChildren<{ href?: string, onClick?: TypedFunction }>) => {

    if (!children) return;

    else if (href) return (
        <li className="group">
            <Navigate comp="link" goto={href} className="inline">
                <BreadCrumb>{children}</BreadCrumb>
            </Navigate>
        </li>
    )

    else if (onClick) return (
        <li className="group">
            <button onClick={onClick} className="inline">
            </button>
        </li>
    )

    else return (
        <li className="group">
            <BreadCrumb>{children}</BreadCrumb>
        </li>
    )

}

export const BreadCrumbs = ({ children, className = '' }: PropsWithChildren<{ className?: string }>) => (
    <ul className={`flex gap-2 overflow-x-auto noScroll ${className}`}>
        {children}
    </ul>
)