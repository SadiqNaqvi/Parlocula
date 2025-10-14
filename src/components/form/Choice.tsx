"use client";

import { useFormContext } from "react-hook-form"

const Choice = ({ label, name, description, type = "checkbox", group, ...args }: { label: string, name: string, type?: "checkbox" | "radio", group?: string, description?: string } & React.LabelHTMLAttributes<HTMLLabelElement>) => {

    const { register, formState: { isSubmitting } } = useFormContext();

    return (
        <label
            {...args}
            className="px-4 py-2 pointer border border-gray20 rounded-full has-[:checked]:border-primary"
        >
            {label}
            <input
                disabled={isSubmitting}
                type={type}
                radioGroup={group}
                {...register(name)}
                className="sr-only"
            />
        </label>
    )
}

export default Choice;