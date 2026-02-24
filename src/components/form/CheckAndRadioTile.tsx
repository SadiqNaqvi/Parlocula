"use client";

import { CheckBoxIcon, EmptyBoxIcon } from "@assets/Icons";
import { OptionalChildren, ParloImage, ParloImageFrameType } from "@components/ui";
import { Frame } from "@type/internal";
import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { twMerge } from "tailwind-merge";

type Props = {
    name: string,
    label: string,
    disable?: boolean,
    checked?: boolean,
    poster?: string | Frame,
    className?: string,
    frameType?: ParloImageFrameType
} & ({
    group?: undefined, type: "checkbox"
} | { group: string, type: "radio" })

const CheckTile = ({ name, label, disable = false, checked = false, poster, frameType, className = "", type, group }: Props) => {

    const { register } = useFormContext();

    return (
        <label
            htmlFor={name}
            className={twMerge(`inline-flex ${disable ? "brightness-50" : ""} flex-cntr-between w-full capitalize px-4 py-2 pointer`, className)}>
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
                <OptionalChildren condition={poster}>
                    <ParloImage
                        frameType={frameType || "poster"}
                        size={48}
                        alt={`Poster of ${label}`}
                        className="size-12 rounded-full object-cover"
                        frame={poster}
                    />
                </OptionalChildren>

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