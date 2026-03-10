"use client";

import { OptionalChildren } from "@components/ui";
import { RefObject } from "react";
import { useFormContext } from "react-hook-form"
import { twMerge } from "tailwind-merge";

type Props = {
    label?: string,
    name: string,
    description?: string,
    containerClasses?: string,
    refObject?: RefObject<HTMLInputElement>
} & React.InputHTMLAttributes<HTMLInputElement>

const Input = ({ label, name, description, containerClasses, className, refObject, ...args }: Props) => {

    const { register, formState: { errors, isSubmitting } } = useFormContext();
    const error = errors[name]?.message?.toString() || "";

    return (
        <div className={twMerge(`space-y-2`, containerClasses)}>
            <OptionalChildren condition={label}>
                <label htmlFor={name}>
                    {label}
                </label>
            </OptionalChildren>
            <input
                disabled={isSubmitting}
                {...args}
                {...register(name)}
                className={twMerge(`inline w-full bg-transparent p-2 border rounded-md focus:border-invert ${error ? "border-red-500" : "border-gray40"} `, className)}
            />
            <OptionalChildren condition={error}>
                <p className="text-sm text-red-500">{error}</p>
            </OptionalChildren>
            <OptionalChildren condition={description}>
                <p className="text-zinc-500 text-sm">{description}</p>
            </OptionalChildren>
        </div>
    )
}

export default Input;