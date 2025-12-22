import { CheckBoxIcon, EmptyBoxIcon } from "@assets/Icons";
import { getPoster } from "@lib/utils";
import { Frame } from "@type/internal";
import Image from "next/image";
import { ParloImage } from "./ui";

type Props = {
    title: string,
    poster?: string | Frame,
    className?: string,
    onClick?: (...arg: any) => any,
    showCheckBox?: boolean,
    checked?: boolean
}

const GeneralTile = ({ title, className = "", poster, onClick, checked, showCheckBox }: Props) => {
    return (
        <div className={className + " flex gap-2 items-center"} onClick={onClick}>
            <div className="flex items-center gap-3">
                {poster && (
                    <ParloImage
                        className="object-cover rounded-md"
                        size={50}
                        alt={`Poster of ${title}`}
                        frame={poster}
                    />
                )}
                <h3>{title}</h3>
            </div>
            {showCheckBox && (
                <span className="ml-auto">
                    {checked ?
                        <CheckBoxIcon />
                        :
                        <EmptyBoxIcon />}
                </span>

            )}
        </div>
    )
}

export default GeneralTile;