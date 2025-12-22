import React, { useEffect, useRef, useState } from "react";

interface OTPInputProps {
    length?: number;
    onChange?: (value: string) => void;
    value?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
    length = 6,
    onChange,
    value,
}) => {
    const [internalValue, setInternalValue] = useState<string>(
        value ?? "".padEnd(length, "")
    );

    const inputsRef = useRef<HTMLInputElement[]>([]);

    // Sync controlled value
    useEffect(() => {
        if (value !== undefined) setInternalValue(value.padEnd(length, ""));
    }, [value, length]);

    const handleChange = (index: number, v: string) => {
        if (!/^\d*$/.test(v)) return; // only digits allowed

        let newValue = internalValue.split("");

        // Handle normal typing
        newValue[index] = v.slice(-1);

        const finalValue = newValue.join("");
        setInternalValue(finalValue);
        onChange?.(finalValue);

        // Move focus
        if (v !== "" && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !internalValue[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData("Text").replace(/\D/g, "").slice(0, length);

        if (!pasted) return;

        const newValue = pasted.padEnd(length, "").slice(0, length);
        setInternalValue(newValue);
        onChange?.(newValue);

        // Focus last filled input
        const lastIndex = Math.min(pasted.length - 1, length - 1);
        inputsRef.current[lastIndex]?.focus();
    };

    return (
        <div className="flex gap-2">
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => {
                        if (el) inputsRef.current[i] = el;
                    }}
                    value={internalValue[i] || ""}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 rounded-md border border-gray-300 text-center text-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    inputMode="numeric"
                    maxLength={1}
                />
            ))}
        </div>
    );
};
