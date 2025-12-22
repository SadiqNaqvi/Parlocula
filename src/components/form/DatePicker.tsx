"use client";

import { GenericDate } from "@type/internal";
import { useFormContext } from "react-hook-form"

type Props = {
    label?: string,
    name: string,
    description?: string,
    defaultValue?: GenericDate,
} & React.InputHTMLAttributes<HTMLInputElement>

const DatePicker = ({ label, name, description, defaultValue, className = '', ...args }: Props) => {

    const { register, formState: { errors, isSubmitting } } = useFormContext();
    const error = errors[name]?.message?.toString() || "";

    return (
        <div className={`space-y-2 pb-2 border-b focus-within:border-gray-500 invalid:border-red-500 ${error ? "border-red-500" : "border-gray20"}`}>

            {label && (
                <label className="text-zinc-500" htmlFor={name}>{label}</label>
            )}

            <input
                type="date"
                disabled={isSubmitting}
                defaultValue={defaultValue ? new Date(defaultValue).toISOString().split("T")[0] : undefined}
                {...args}
                {...register(name)}
                className={`${className} w-full bg-transparent`}
            />
            {error ? <p className="text-sm text-red-500">{error}</p>
                :
                description && <p className="text-zinc-500 text-sm">{description}</p>
            }
        </div>
    )
}

export default DatePicker;