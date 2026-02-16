import { CheckBoxIcon, EmptyBoxIcon } from "@assets/Icons";
import { Frame } from "@type/internal";
import { twMerge } from "tailwind-merge";
import { OptionalChildren, ParloImage } from "./ui";

type Props = {
    title: string,
    poster?: string | Frame,
    className?: string,
    onClick?: (...arg: any) => any,
    showCheckBox?: boolean,
    checked?: boolean
}

const GeneralTile = ({ title, className, poster, onClick, checked, showCheckBox }: Props) => {
    return (
        <article className={twMerge("w-full flex gap-2 flex-cntr-between", className)} onClick={onClick}>
            <div className="flex items-center gap-2">
                <OptionalChildren condition={poster}>
                    <ParloImage
                        frameType="poster"
                        className="size-12 min-w-12 object-cover rounded-md"
                        size={48}
                        alt={`Poster of ${title}`}
                        frame={poster}
                    />
                </OptionalChildren>
                <h4>{title}</h4>
            </div>
            <OptionalChildren condition={showCheckBox}>
                <span>
                    <OptionalChildren condition={checked} fallback={<EmptyBoxIcon />}>
                        <CheckBoxIcon />
                    </OptionalChildren>
                </span>
            </OptionalChildren>
        </article>
    )
}

export default GeneralTile;