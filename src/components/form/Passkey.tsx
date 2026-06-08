"use client";

import { EyeIcon, EyeSlashIcon } from "@assets/Icons";
import { Button, OptionalChildren } from "@components/ui";
import { useState } from "react";
import { useFormContext } from "react-hook-form"
import { twMerge } from "tailwind-merge";

type Props = {
    label?: string,
    name: string,
    description?: string,
    containerClasses?: string,
} & React.InputHTMLAttributes<HTMLInputElement>

const Passkey = ({ label, name, description, className, containerClasses, ...args }: Props) => {

    const { register, formState: { errors, isSubmitting } } = useFormContext();
    const error = errors[name]?.message?.toString() || "";
    const [isPasskey, setIsPasskey] = useState(true);

    return (
        <div className={twMerge(`space-y-2`, containerClasses)}>

            <OptionalChildren condition={label}>
                <label className="block" htmlFor={name}>
                    {label}
                </label>
            </OptionalChildren>

            <div className={`flex w-full gap-2 border rounded-md focus:border-invert ${error ? "border-red-500" : "border-gray40"}`}>

                <input
                    type={isPasskey ? "password" : "text"}
                    disabled={isSubmitting}
                    {...args}
                    {...register(name)}
                    className={twMerge("inline w-full bg-transparent border-0 p-2", className)}
                />

                <Button
                    id="passkey-view"
                    title={isPasskey ? "Show Passkey" : "Hide Passkey"}
                    type="button"
                    onClick={() => setIsPasskey(!isPasskey)}
                >
                    <OptionalChildren condition={isPasskey} fallback={<EyeSlashIcon />}>
                        <EyeIcon />
                    </OptionalChildren>
                </Button>

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

export default Passkey;