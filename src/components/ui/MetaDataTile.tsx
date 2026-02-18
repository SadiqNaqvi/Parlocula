import Navigate from "@components/Navigate";
import { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";
import OptionalChildren from "./OptionalChildren";

export const MetadataTileContainer = ({ children, className }: PropsWithChildren<{ className?: string }>) => (
    <ul className={twMerge("flex gap-2 items-center overflow-x-auto noScroll", className)}>
        {children}
    </ul>
)

type Props = {
    className?: string;
    skipDisc?: boolean;
    condition?: boolean;
    href?: string;
}

const MetadataContentTile = ({ children, skipDisc, }: PropsWithChildren<Pick<Props, "skipDisc">>) => (
    <OptionalChildren condition={!skipDisc} fallback={children}>
        <span className="group-first:hidden">•</span>
        <div className="text-sm whitespace-nowrap">{children}</div>
    </OptionalChildren>
)

const MetadataTile = ({ children, className, skipDisc, condition, href }: PropsWithChildren<Props>) => {

    return (
        <OptionalChildren condition={condition ?? true}>
            <li className={twMerge("flex gap-2 text-zinc-500 group items-center", className)}>
                <OptionalChildren condition={href} fallback={(
                    <MetadataContentTile skipDisc={skipDisc}>{children}</MetadataContentTile>
                )}>
                    <Navigate className="contents" goto={href || ""} comp="link">
                        <MetadataContentTile skipDisc={skipDisc}>{children}</MetadataContentTile>
                    </Navigate>
                </OptionalChildren>
            </li>
        </OptionalChildren>
    )
}

export default MetadataTile;