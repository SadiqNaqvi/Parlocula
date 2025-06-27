import { CheckBoxIcon, EmptyBoxIcon } from "@assets/Icons";
import { getPoster } from "@lib/utils";
import Image from "next/image";
import { useFormContext } from "react-hook-form";

const posterInfo = { aspect_ratio: "1", height: "50", width: "50" }

type Props = {
    name: string,
    label: string,
    disable?: boolean,
    checked?: boolean,
    poster?: string,
    className?: string,
} & ({
    group?: undefined, type: "checkbox"
} | { group: string, type: "radio" })

const CheckTile = ({ name, label, disable = false, checked = false, poster, className = "", type, group }: Props) => {

    const { register } = useFormContext();

    return (
        <label
            htmlFor={name}
            className={`inline-flex ${disable ? "brightness-50" : ""} flex-cntr-between w-full capitalize px-4 py-2 pointer ${className}`}>
            <input
                {...register(type === "radio" ? group : name)}
                value={type === "radio" ? name : undefined}
                type={type}
                disabled={disable}
                defaultChecked={checked}
                id={name}
                className="sr-only peer"
            />
            <div className="flex gap-3 items-center">
                {poster && <Image
                    height={48}
                    width={48}
                    alt={`Poster of ${label}`}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                    src={poster}
                />}

                <span className="font-medium">{label}</span>
            </div>

            <CheckBoxIcon className="hidden peer-checked:block" />
            <EmptyBoxIcon className="block peer-checked:hidden" />
        </label>
    )
}

export default CheckTile;