"use client";

import { TypedFunction } from "@type/other";

type Props = {
    label: React.ReactNode,
    checked: boolean,
    className?: string,
    onClick: TypedFunction,
}

const ToggleButtonBar = ({ label, checked, className = '' }: Props) => {
    return (
        <button className={`pointer inline-flex flex-cntr-between ${className || "w-full"}`}>
            <span className="font-medium">{label}</span>
            <div className={`relative w-11 h-6 bg-gray-200 rounded-full dark:bg-gray-700 ${checked ? "after:translate-x-full after:border-white bg-orange-500" : "after:bg-white after:border-gray-300"} after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600`}></div>
        </button>
    )
}

export default ToggleButtonBar;