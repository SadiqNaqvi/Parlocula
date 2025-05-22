"use client";

import { EyeIcon, EyeSlashIcon } from "@assets/Icons";
import { useState } from "react";
import { useFormContext } from "react-hook-form"

const Password = ({ label, name, description, ...args }: { label?: string, name: string, description?: string } & React.InputHTMLAttributes<HTMLInputElement>) => {

    const { register, formState: { errors, isSubmitting } } = useFormContext();
    const error = errors[name]?.message?.toString() || "";
    const [isPassword, setIsPassword] = useState(true);

    return (
        <div className={`space-y-2 pb-2 invalid:border-red-500 border-b ${error ? "border-red-500" : "focus-within:border-gray-500 border-gray20"}`}>
            {label && <label className="text-zinc-500" htmlFor={name}>{label}</label>}
            <div className="flex w-full gap-2">
                <input
                    type={isPassword ? "password" : "text"}
                    disabled={isSubmitting}
                    {...args}
                    {...register(name)}
                    className={"inline flex-1 bg-transparent"}
                />
                <button type="button" onClick={() => setIsPassword(!isPassword)}>
                    {isPassword ?
                        <EyeIcon />
                        :
                        <EyeSlashIcon />
                    }
                </button>
            </div>
            {error ?
                <p className="text-sm text-red-500">{error}</p>
                :
                description && <p className="text-zinc-500 text-sm">{description}</p>
            }
        </div>
    )
}

export default Password;