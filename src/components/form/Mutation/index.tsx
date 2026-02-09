import { EditIcon } from "@assets/Icons";
import Input from "../Input";
import Textarea from "../Textarea";
import { twMerge } from "tailwind-merge";

type TextInputProps = {
    name: string;
    placeholder: string;
    required: boolean;
    maxLength: number;
    minLength?: number;
    defaultVal?: string;
    className?: string;
}

export const DisplayNameInput = ({ maxLength, name, placeholder, minLength, required, defaultVal, className }: TextInputProps) => (
    <div className="flex gap-2 items-center w-full group">
        <EditIcon className="text-gray-500 group-has-[:focus]:text-inherit" />
        <Input
            name={name}
            defaultValue={defaultVal}
            placeholder={placeholder}
            className={twMerge("p-0 border-0 sm:text-xl font-semibold flex-1", className)}
            required={required}
            minLength={minLength}
            maxLength={maxLength}
        />
    </div>
)

export const TextAreaInput = ({ maxLength, name, placeholder, minLength, required, defaultVal, className }: TextInputProps) => (
    <div className="flex gap-2 w-full group">
        <EditIcon className="size-4 text-gray-500 group-has-[:focus]:text-inherit" />
        <Textarea
            name={name}
            defaultValue={defaultVal}
            placeholder={placeholder}
            containerClassName={twMerge("border-0 flex-1", className)}
            required={required}
            minLength={minLength}
            maxLength={maxLength}
        />
    </div>
)