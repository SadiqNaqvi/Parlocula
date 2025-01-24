"use client";

import { useFormContext } from "react-hook-form"

const Textarea = ({ label, name, description, ...args }: { label?: string, name: string, description?: string, } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {

    const { register, formState: { errors } } = useFormContext();
    const error = errors[name]?.message?.toString() || "";


    return (
        <div className={`space-y-2 pb-2 border-b ${error ? "border-red-500" : "border-gray20"}`}>
            {label && <label htmlFor={name}>{label}</label>}
            <textarea
                {...args}
                {...register(name)}
                className="w-full"
            >
            </textarea>
            {error ? <p className="text-sm text-red-500">{error}</p>
                :
                description && <p className="text-zinc-500 text-sm">{description}</p>
            }
        </div>
    )
}

export default Textarea;