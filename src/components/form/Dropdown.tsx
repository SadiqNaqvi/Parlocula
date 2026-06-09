import "@styles/select.css";
import { OptionalChildren } from "@components/ui";
import { useFormContext } from "react-hook-form";
import { twMerge } from "tailwind-merge";

type DropdownProps = {
    name: string,
    options: string[]
    label?: string,
    description?: string,
    containerClassName?: string
}

const Dropdown = ({ name, options, label, containerClassName, description }: DropdownProps) => {

    const { register, formState: { errors } } = useFormContext();
    const error = errors[name]?.message?.toString() || "";

    return (
        <div className={twMerge("space-y-2", containerClassName)}>
            <OptionalChildren condition={label}>
                <label htmlFor={name} className="block mb-2">
                    {label}
                </label>
            </OptionalChildren>
            <select
                {...register(name)}
                className="block w-full px-4 py-2 border border-gray-500 rounded-md capitalize"
            >
                {options.map(option => (
                    <option
                        key={option}
                        value={option}
                        className="capitalize"
                    >
                        {option}
                    </option>
                ))}
            </select>

            <OptionalChildren condition={error}>
                <p className="text-sm text-red-500">{error}</p>
            </OptionalChildren>

            <OptionalChildren condition={description}>
                <p className="ghostColor text-sm">{description}</p>
            </OptionalChildren>

        </div>
    )

}

export default Dropdown;