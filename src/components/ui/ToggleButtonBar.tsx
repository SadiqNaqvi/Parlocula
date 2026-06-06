"use client";

import { TypedFunction } from "@type/other";
import Button from "./Button";

type Props = {
    label: string,
    checked: boolean,
    className?: string,
    onClick: TypedFunction,
}

const ToggleButtonBar = ({ label, checked, className = '', onClick }: Props) => {
    return (
        <Button
            id={`toggle-button-${label}`}
            title={label}
            onClick={onClick}
            className={`pointer inline-flex flex-cntr-between ${className || "w-full"}`}
        >
            <span className="font-medium">{label}</span>
            <div className={`relative w-11 h-6 rounded-full bg-gray30 border border-gray-500 ${checked ? "bg-secondary border-primary after:h-4 after:w-4 justify-end after:bg-[var(--primary)]" : "after:bg-gray-500"} after:content-[''] px-1 flex items-center after:rounded-full after:h-3 after:w-3 after:transition-all`}></div>
        </Button>
    )
}

export default ToggleButtonBar;