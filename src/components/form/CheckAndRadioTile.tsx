import { CheckBoxIcon, EmptyBoxIcon } from "@assets/Icons";
import { getPoster } from "@lib/utils";
import Image from "next/image";
import { useFormContext } from "react-hook-form";

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

export const NormalCheckTile = ({ name, label, disable = false, checked = false, poster, className = "", type, group }: Props) => {

    return (
        <label
            htmlFor={name}
            className={`inline-flex ${disable ? "brightness-50" : ""} flex-cntr-between w-full capitalize px-4 py-2 pointer ${className}`}>
            <input
                name={type === "radio" ? group : name}
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

type ActionTileProps = {
    label: string,
    data: unknown,
    poster?: string,
    checked: boolean,
    action: (d: unknown) => unknown,
    className?: string,
}
export const ClickableActionTile = ({ action, data, label, poster, checked, className = '' }: ActionTileProps) => {

    return (
        <button
            onClick={() => action(data)}
            title={label}
            className={`inline-flex flex-cntr-between w-full capitalize px-4 py-2 pointer ${className}`}>
            <div className="flex gap-3 items-center">
                {poster !== undefined && <Image
                    height={48}
                    width={48}
                    alt={`Poster of ${label}`}
                    loading="lazy"
                    className="size-12 rounded-full object-cover"
                    src={poster}
                />}

                <span className="font-medium">{label}</span>
            </div>

            <CheckBoxIcon className={checked ? "block" : "hidden"} />
            <EmptyBoxIcon className={checked ? "hidden" : "block"} />
        </button>
    )
}

export default CheckTile;