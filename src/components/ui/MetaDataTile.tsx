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
    nsfw?: boolean;
    spoiler?: boolean;
}

const MetadataContentTile = ({ children, skipDisc, }: PropsWithChildren<Pick<Props, "skipDisc">>) => (
    <OptionalChildren condition={!skipDisc} fallback={children}>
        <span className="group-first:hidden">•</span>
        <div className="text-sm whitespace-nowrap">{children}</div>
    </OptionalChildren>
)

const commonClassName = "px-2 py-1 text-sm border color-secondary rounded-md"
const nsfwClassName = `${commonClassName} bg-purple-500/30 border-purple-500`;
const spoilerClassName = `${commonClassName} bg-orange-500/30 border-orange-500`

const MetadataTile = ({ children, className, skipDisc, condition, href, nsfw, spoiler }: PropsWithChildren<Props>) => {

    return (
        <OptionalChildren condition={condition ?? true}>
            <li className={twMerge("flex gap-2 text-zinc-500 group items-center", nsfw ? nsfwClassName : '', spoiler ? spoilerClassName : '', className)}>
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