import { CheckBoxIcon, EmptyBoxIcon } from "@assets/Icons";
import Image from "next/image";

type Props = {
    title: string,
    poster?: string,
    className?: string,
    onClick?: (...arg: any) => any,
    showCheckBox?: boolean,
    checked?: boolean
}

const GeneralTile = ({ title, className = "", poster, onClick, checked, showCheckBox }: Props) => {
    return (
        <div className={className + " flex gap-2 items-center"} onClick={onClick}>
            <div className="flex items-center gap-3">
                {poster && <Image className="size-12 object-cover rounded-md " width={50} height={50} alt={`Poster of ${title}`} src={poster} />}
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