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
        <span className="text-sm">{children}</span>
    </OptionalChildren>
)

const MetadataTile = ({ children, className, skipDisc, condition, href }: PropsWithChildren<Props>) => {

    return (
        <OptionalChildren condition={condition ?? true}>
            <li className={twMerge("space-x-2 text-zinc-500 group", className)}>
                <OptionalChildren condition={href} fallback={(
                    <MetadataContentTile skipDisc={skipDisc}>{children}</MetadataContentTile>
                )}>
                    <Navigate goto={href || ""} comp="link" className="no-underline">
                        <MetadataContentTile skipDisc={skipDisc}>{children}</MetadataContentTile>
                    </Navigate>
                </OptionalChildren>
            </li>
        </OptionalChildren>
    )
}

export default MetadataTile;