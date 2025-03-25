"use client";

import { useFormContext } from "react-hook-form"

const Input = ({ label, name, description, ...args }: { label?: string, name: string, description?: string } & React.InputHTMLAttributes<HTMLInputElement>) => {

    const { register, formState: { errors, isSubmitting } } = useFormContext();
    const error = errors[name]?.message?.toString() || "";

    return (
        <div className={`space-y-2 pb-2 border-b focus-within:border-gray-500 invalid:border-red-500 ${error ? "border-red-500" : "border-gray20"}`}>
            {label &&
                <label htmlFor={name}>
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