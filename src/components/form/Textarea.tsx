"use client";

import { OptionalChildren } from "@components/ui";
import { useFormContext } from "react-hook-form"
import { twMerge } from "tailwind-merge";

type Props = {
    label?: string,
    name: string,
    description?: string,
    containerClassName?: string
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = ({ label, name, description, className, containerClassName, ...args }: Props) => {

    const { register, formState: { errors } } = useFormContext();
    const error = errors[name]?.message?.toString() || "";

    return (
        <div className={twMerge(`space-y-2 max-h-50 overflow-y-auto border-b ${error ? "border-red-500 pb-2" : "border-gray20 pb-[2px]"}`, containerClassName)}>

            <OptionalChildren condition={label}>
                <label className="capitalize mb-4" htmlFor={name}>{label}</label>
            </OptionalChildren>

            <textarea
                {...args}
                {...register(name)}
                className={twMerge("w-full", className)}
            >
            </textarea>

            <OptionalChildren condition={error}>
                <p className="text-sm text-red-500">{error}</p>
            </OptionalChildren>

            <OptionalChildren condition={description}>
                <p className="text-zinc-500 text-sm">{description}</p>
            </OptionalChildren>
        </div>
    )
}

export default Textarea;