import { RightChevron } from "@assets/Icons";
import Navigate from "@components/Navigate";
import { TypedFunction } from "@type/other";
import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import Button from "./Button";

type BreadCrumbProps = { className?: string }

const BreadCrumb = ({ children, className }: PropsWithChildren<BreadCrumbProps>) => (
    <div style={{ display: "flex" }} className={twMerge("text-sm gap-2 items-center hover:underline whitespace-nowrap line-clamp-1", className)}>
        <strong>{children}</strong>
        <RightChevron className="size-4 group-last:rotate-90" />
    </div>
)

export const BreadCrumbTile = ({ children, href, onClick, className, title }: PropsWithChildren<{ href?: string, onClick?: TypedFunction, title?: string }> & BreadCrumbProps) => {

    if (!children) return;

    else if (href) return (
        <li className="group">
            <Navigate
                aria-label={title}
                title={title}
                historyPayload={{ title: typeof children === "string" ? children : undefined }}
                comp="link"
                goto={href}
                className="inline"
            >
                <BreadCrumb className={className}>{children}</BreadCrumb>
            </Navigate>
        </li>
    )

    else if (onClick) return (
        <li className="group">
            <Button
                id={`breadcrumb-${title}`}
                title={String(title)}
                onClick={onClick}
                className="inline"
            >
                <BreadCrumb className={className}>{children}</BreadCrumb>
            </Button>
        </li>
    )

    else return (
        <li className="group">
            <BreadCrumb className={className}>{children}</BreadCrumb>
        </li>
    )

}

export const BreadCrumbs = ({ children, className = '' }: PropsWithChildren<{ className?: string }>) => (
    <ul className={`flex gap-2 overflow-x-auto noScroll ${className}`}>
        {children}
    </ul>
)