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
        <div className={twMerge("space-y-2", containerClassName)}>

            <OptionalChildren condition={label}>
                <label className="capitalize mb-2 block" htmlFor={name}>{label}</label>
            </OptionalChildren>
            <div
                className={twMerge("max-h-50 overflow-y-auto p-2 border rounded-md", className, error ? "border-red-500 focus-within:outline-red-500" : "border-gray40")}
            >
                <textarea
                    {...args}
                    {...register(name)}
                    className="size-full"
                >
                </textarea>
            </div>

            <OptionalChildren condition={error}>
                <p className="text-sm text-red-500">{error}</p>
            </OptionalChildren>

            <OptionalChildren condition={description}>
                <p className="ghostColor text-sm">{description}</p>
            </OptionalChildren>
        </div>
    )
}

export default Textarea;