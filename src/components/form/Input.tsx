"use client";

import { useFormContext } from "react-hook-form"

const Input = ({ label, name, description, containerClasses, ...args }: { label?: string, name: string, description?: string, containerClasses?: string } & React.InputHTMLAttributes<HTMLInputElement>) => {

    const { register, formState: { errors, isSubmitting } } = useFormContext();
    const error = errors[name]?.message?.toString() || "";

    return (
        <div className={`focus-within:border-gray-500 invalid:border-red-500 ${error ? "border-red-500" : "border-gray20"} ${containerClasses || "space-y-2 pb-2 border-b"}`}>
            {label &&
                <label htmlFor={name} className="capitalize">
                    {label}
                </label>
            }
            <input
                disabled={isSubmitting}
                {...args}
                {...register(name)}
                className={args.className ?? "" + " inline w-full bg-transparent"}
            />
            {error ? <p className="text-sm text-red-500">{error}</p>
                :
                description && <p className="text-zinc-500 text-sm">{description}</p>
            }
        </div>
    )
}

export default Input;