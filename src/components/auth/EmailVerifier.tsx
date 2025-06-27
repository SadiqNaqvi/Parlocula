import { LeftChevron } from "@assets/Icons";
import { Form, Input } from "@components/form";
import { generateFingerprint } from "@lib/auth";
import { sendVerificationCode, verifyCodes } from "@lib/helpers/server";
import { useCustomReducer } from "@lib/hooks";
import { emailSchema, verificationCodeSchema } from "@lib/schemas";
import { convertCodeIntoError, getTimeInFuture } from "@lib/utils";
import { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

const schema = z.object({
    email: emailSchema,
});

const CodeCounter = ({ canTry, func }: { canTry: boolean, func: () => void }) => {

    const [canSend, setCanSend] = useState(true);

    const callFunc = () => {
        func();
        setCanSend(false);
        setTimeout(() => setCanSend(true), 2000 * 60)
    }

    if (!canTry) return (
        <p className="text-sm text-center">You've reached the limit to send verifiction codes for now. Please try again after an hour.</p>
    )

    else if (canSend) return (
        <button className="text-center smallBtn mx-auto" onClick={callFunc}>Resend code</button>
    )

    else return <p className="text-sm text-center text-slate-500">You can resend an code in 2 mins.</p>
}

const EmailVerifier = ({ callback }: { callback: (email: string) => Promise<string | undefined> }) => {

    const { email, page, canTry, code, sentAt, tries, setter } = useCustomReducer({
        email: "", page: 0, code: "", tries: 0, sentAt: null as Date | null, canTry: true
    });

    const setError = (error: string) => {
        toast.error(error, { duration: 10000 })
    }

    const verifyCode = async (data: { code: string }) => {
        if (tries >= 3)
            return setError("You've reached the limit to verify your email. Please try again in an hour.");

        else if (sentAt && Date.now() > getTimeInFuture({ unit: "m", from: sentAt, timeVal: 5 }))
            return setError("Code expired. Please re-send a verification code or try again in an hour.");

        else if (await verifyCodes({ inputCode: `${data.code}`, realCode: code }))
            return await callback(email);

        else {
            setter({ tries: tries + 1 });
            setError("Wrong Verification Code! If you didn't get a verification code on your email you can resend it.")
        }
    }

    const sendCode = async (input?: string) => {

        const emailToSend = input ?? email;
        const response = await sendVerificationCode(emailToSend, await generateFingerprint())

        if (!response.success) {
            if (response.errCode === "pp209") setter({ canTry: false });
            else setError(convertCodeIntoError(response.errCode) as string);
            return;
        }

        setter({ code: response.result, sentAt: new Date() });
        toast.success("Verification Email sent successfully")
    }

    const submit = async (data: { email: string }) => {
        const { email } = data;
        await sendCode(email);
        setter({ email, page: 1 });
    }

    return (
        <>
            {page ?
                <>
                    <div className="flex mb-2 gap-4">
                        <button className="iconBtn my-auto" onClick={() => setter({ page: 0 })}>
                            <LeftChevron />
                        </button>
                        <h2 className="text-3xl text-center font-semibold">Verify Your Email</h2>
                    </div>
                    <p className="mb-8 text-center text-sm text-zinc-500">Enter 6 digit verification code that has been sent to your email.</p>

                    <Form schema={verificationCodeSchema} submit={verifyCode}>
                        <Input
                            type="number"
                            maxLength={6}
                            name="code"
                            placeholder="XXXXXX"
                            autoFocus
                        />
                        <button className="primary w-full mt-4">Verify</button>
                        <div className="mt-4">
                            <CodeCounter canTry={canTry} func={sendCode} />
                        </div>
                        <p>Please check spam or all email if you can't find our email. If you still think you didn't recieve an email from us, Please check your email or try again after an hour.</p>
                    </Form>
                </>
                :
                <>
                    <h2 className="text-3xl uppercase text-center mb-8">Welcome</h2>
                    <Form
                        className="space-y-4"
                        submit={submit}
                        schema={schema}>
                        <Input
                            name="email"
                            defaultValue={email}
                            autoFocus
                            type="email"
                            className="bg-transparent w-full"
                            placeholder="Email"
                        />
                        <button className="primary w-full">Continue</button>
                    </Form>
                </>
            }
        </>
    )
}

export default EmailVerifier;