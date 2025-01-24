import { useRef, useState } from "react";
import Form from "./Form";
import Input from "./Input";

export default function OtpInput({ long = 6, callback }: { long?: number, callback: (otp: string) => void }) {
    const [otp, setOtp] = useState(Array(long).fill(""));
    const inputRefs = useRef<HTMLInputElement[]>([]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (
            !/^[0-9]{1}$/.test(e.key) &&
            e.key !== "Backspace" &&
            e.key !== "Delete" &&
            e.key !== "Tab" &&
            !e.metaKey
        ) e.preventDefault();

        if (e.key === "Delete" || e.key === "Backspace") {
            const index = inputRefs.current.indexOf(e.target as never);
            if (!inputRefs.current[index]) return;
            if (index >= 0) {
                // setOtp((prevOtp) => [
                //     ...prevOtp.slice(0, index),
                //     "",
                //     ...prevOtp.slice(index + 1)
                // ]);
                if (!otp[index] && index > 0)
                    inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { target } = e;
        const index = inputRefs.current.indexOf(target as never);
        if (target.value) {
            setOtp((prevOtp) => [
                ...prevOtp.slice(0, index),
                target.value,
                ...prevOtp.slice(index + 1),
            ]);
            if (index < otp.length - 1 && inputRefs.current[index + 1]) {
                inputRefs.current[index + 1]!.focus();
            }
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text");
        console.log(text);
        if (!new RegExp(`^[0-9]{${otp.length}}$`).test(text)) {
            return;
        }
        const digits = text.split("");
        setOtp(digits);
    };


    return (
        <>
            <Form schema={schema} submit={submit}>
                <div className="flex gap-2 w-full max-w-full">
                    {otp.map((digit, index) => (
                        <Input
                            name={`${index}`}
                            key={index}
                            type="text"
                            maxLength={1}
                            onChange={handleInput}
                            onKeyDown={handleKeyDown}
                            onPaste={handlePaste}
                            ref={(el) => (inputRefs.current[index] = el)}
                            className="flex-1 aspect-square bg-transparent w-full rounded-lg border border-gray50 p-1 text-center text-xl font-medium"
                        />
                    ))}
                </div>
                <button
                    className="primary mt-6 w-full">Verify</button>
            </Form>
        </>
    );
}
