import { CheckBoxIcon, CheckIcon, EmptyBoxIcon } from "@assets/Icons"
import { getInternalPoster } from "@lib/utils";
import Image from "next/image";
import { useFormContext } from "react-hook-form";

const posterInfo = { aspect_ratio: "1", height: "50", width: "50" }

const CheckTile = ({ name, lable, disable = false, checked = false, poster, className = "" }: { name: string, lable: string, disable?: boolean, checked?: boolean, poster?: string, className?: string }) => {

    const { register } = useFormContext();

    return (
        <label
            onClick={e => e.stopPropagation()}
            htmlFor={name}
            className={`inline-flex ${disable ? "brightness-50" : ""} flex-cntr-between w-full capitalize px-4 py-2 pointer ${className}`}>
            <input
                type="checkbox"
                {...register(name)}
                disabled={disable}
                defaultChecked={checked}
                id={name}
                className="sr-only peer"
            />
            <div>
                {poster && <Image height={50} width={50} alt={`Poster of ${lable}`} loading="lazy" src={getInternalPoster({ path: poster, options: posterInfo })} />}

                <span className="font-medium">{lable}</span>
            </div>

            <CheckBoxIcon classnames="hidden peer-checked:block" />
            <EmptyBoxIcon classnames="block peer-checked:hidden" />
        </label>
    )
}

export default CheckTile;