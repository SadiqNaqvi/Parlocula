import { EditIcon } from "@assets/Icons";
import Input from "../Input";
import Textarea from "../Textarea";
import { twMerge } from "tailwind-merge";
import BottomSheet from "@components/BottomSheet";
import { PropsWithChildren } from "react";

export { default as ConnectionsInput } from "./ConnectionsInput";
export { default as ShelfItemInput } from "./ShelfItemInput";
export { default as PostMutation } from "./PostMutation";
export { default as ThreadMutation } from "./ThreadMutation";
export { default as ThreadSelectionSheet } from "./ThreadSelectionSheet";
export { default as UserMutation } from "./UserMutation";
export { default as ShelfMutation } from "./ShelfMutation";


type TextInputProps = {
    name: string;
    placeholder: string;
    required: boolean;
    maxLength: number;
    minLength?: number;
    defaultVal?: string;
    className?: string;
    iconClassName?: string;
    autoFocus?: boolean;
}

export const DisplayNameInput = ({ maxLength, name, placeholder, minLength, required, defaultVal, className, iconClassName, autoFocus }: TextInputProps) => (
    <div className="flex gap-2 items-center w-full group">
        <EditIcon className={twMerge("text-gray-500 group-has-focus:text-inherit", iconClassName)} />
        <Input
            name={name}
            defaultValue={defaultVal}
            placeholder={placeholder}
            className={twMerge("p-0 border-0 sm:text-xl font-semibold flex-1", className)}
            containerClasses="w-full"
            required={required}
            minLength={minLength}
            maxLength={maxLength}
            autoFocus={autoFocus}
        />
    </div>
)

export const TextAreaInput = ({ maxLength, name, placeholder, minLength, required, defaultVal, className, iconClassName, autoFocus }: TextInputProps) => (
    <div className="flex gap-2 w-full group">
        <EditIcon className={twMerge("size-4 text-gray-500 group-has-focus:text-inherit", iconClassName)} />
        <Textarea
            name={name}
            defaultValue={defaultVal}
            placeholder={placeholder}
            containerClassName="flex-1"
            className={twMerge("p-0 border-0", className)}
            required={required}
            minLength={minLength}
            maxLength={maxLength}
            autoFocus={autoFocus}
        />
    </div>
)

export const InitialDescriptionSheet = ({ children }: PropsWithChildren) => (
    <BottomSheet state={true}>
        {children}
    </BottomSheet>
)

export const IDS_Section = ({ children }: PropsWithChildren) => (
    <section className="my-4 px-2 sm:px-0 space-y-2">
        {children}
    </section>
)

export const IDS_Heading = ({ children }: PropsWithChildren) => (
    <h5 className="parloHeading text-left">
        {children}
    </h5>
)