"use client";

import { useFormContext } from "react-hook-form"

const Choice = ({ label, name, description, type = "checkbox", group, ...args }: { label: string, name: string, type?: "checkbox" | "radio", group?: string, description?: string } & React.LabelHTMLAttributes<HTMLLabelElement>) => {

    const { register, formState: { isSubmitting } } = useFormContext();

    return (
        <label
            {...args}
            htmlFor={name}
            className="px-4 py-2 cursor-pointer border-2 border-gray30 has-checked:border-(--secondary) rounded-full text-sm relative"
        >
            {label}
            <input
                {...register(group || name)}
                value={type === "radio" ? name : undefined}
                disabled={isSubmitting}
                type={type}
                radioGroup={group}
                className="sr-only"
                id={name}
            />
        </label>
    )
}

export default Choice;