"use client";
import { useFormContext } from "react-hook-form";

const ToggleButton = ({ label, className = '' }: { label: string, className?: string }) => {
    const { register } = useFormContext();
    return (
        <label htmlFor={label} className={`inline-flex flex-cntr-between w-full pointer ${className}`}>
            <input
                {...register(label)}
                type="checkbox"
                name={label}
                id={label}
                className="sr-only peer" />
            <span className="font-medium">{label}</span>
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
        </label>
    )
}

export default ToggleButton;