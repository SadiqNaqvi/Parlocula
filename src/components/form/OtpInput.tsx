import React, { RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";

interface OTPInputProps {
    length?: number;
    onFilled?: (value: string) => void;
    onSubmit?: (value: string) => void;
    value?: string;
    getterRef: RefObject<{ otp: string } | null>
}

const OTPInput = ({
    length = 6,
    onFilled,
    onSubmit,
    value,
    getterRef
}: OTPInputProps) => {
    const [internalValue, setInternalValue] = useState<string>(
        value ?? "".padEnd(length, "")
    );

    const inputsRef = useRef<HTMLInputElement[]>([]);

    useImperativeHandle(getterRef, () => ({
        otp: internalValue
    }));

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
        if (finalValue.length === length) {
            onFilled?.(finalValue);
        }

        // Move focus
        if (v !== "" && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !internalValue[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        } else if (e.key === "Enter" && index === inputsRef.current.length - 1 && internalValue.length === 6) {
            onSubmit?.(internalValue);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData("Text").replace(/\D/g, "").slice(0, length);

        if (!pasted) return;

        const newValue = pasted.padEnd(length, "").slice(0, length);
        setInternalValue(newValue);
        if (newValue.length === length) {
            onFilled?.(newValue);
        }

        // Focus last filled input
        const lastIndex = Math.min(pasted.length - 1, length - 1);
        inputsRef.current[lastIndex]?.focus();
    };

    return (
        <div className="flex gap-2 w-full">
            {Array.from({ length }).map((_, i) => (
                <input
                    key={i}
                    ref={(el) => {
                        if (el) inputsRef.current[i] = el;
                    }}
                    data-testid={`otpInput-${i}`}
                    autoFocus={!i}
                    value={internalValue[i] || ""}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className={`w-[15%] aspect-square h-auto rounded-md border border-gray20 bg-gray10 text-center`}
                    inputMode="numeric"
                    maxLength={1}
                />
            ))}
        </div>
    );
};

export default OTPInput;
