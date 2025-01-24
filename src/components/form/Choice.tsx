"use client";

import { useFormContext } from "react-hook-form"

const Choice = ({ label, name, description, ...args }: { label: string, name: string, description?: string } & React.LabelHTMLAttributes<HTMLLabelElement>) => {

    const { register, formState: { isSubmitting } } = useFormContext();

    return (
        <label
            {...args}
        >
            {label}
            <input
                disabled={isSubmitting}
                type="checkbox"
                {...register(name)}
                className="sr-only"
            />
        </label>
    )
}

export default Choice;