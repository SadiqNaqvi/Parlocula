"use client"

import { Form, Input } from "@components/form";
import { FormSubmitReturnType } from "@components/form/Form";
import Navbar from "@components/Navbar";
import { generateFingerprint } from "@lib/auth";
import { sendVerificationCode } from "@lib/helpers/server";
import { useCustomReducer } from "@lib/hooks";
import { emailSchema, verificationCodeSchema } from "@lib/schemas";
import { codetoError, getTimeInFuture } from "@lib/utils";
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

const setError = (error: string) => {
    toast.error(error, { duration: 10000 })
}

const EmailVerifier = ({ callback }: { callback: (email: string, code: number) => Promise<FormSubmitReturnType> }) => {

    const { email, page, canTry, sentAt, tries, setter } = useCustomReducer({
        email: "", page: "email", tries: 0, sentAt: null as Date | null, canTry: true
    });

    const verifyCode = async ({ code }: { code: number }) => {
        if (tries >= 3)
            return setError("You've reached the limit to verify your email. Please try again in an hour.");

        else if (sentAt && Date.now() > getTimeInFuture({ unit: "m", from: sentAt, timeVal: 5 }))
            return setError("Code expired. Please re-send a verification code or try again in an hour.");

        const errCode = await callback(email, code);
        if (errCode === "invalid_verification_code") setter({ tries: tries + 1 });

        return errCode;
    }

    const sendCode = async (input?: string) => {

        const emailToSend = input ?? email;
        const response = await sendVerificationCode(emailToSend, await generateFingerprint())

        if (response.success) {
            setter({ sentAt: new Date() });
            toast.success("Verification Email sent successfully");
            return true;
        }

        else if (response.errCode === "email_verification_limit_exceed") {
            setter({ canTry: false });
            setError("Too many attempts. Please try again after an hour.")
        }

        else setError(codetoError(response.errCode) as string);
        return false;

    }

    const submit = async (data: { email: string }) => {
        const { email } = data;
        const done = await sendCode(email);
        if (done) setter({ email, page: "verification" });
        // await callback(email, 0);

    }

    if (page === "verification") return (
        <>
            <Navbar navTitle="Verify Your Email" onGoBack={() => setter({ page: "email" })} />

            <p className="mb-8 text-center text-sm text-zinc-500">Enter 6 digit verification code that has been sent to your email {email}.</p>

            <Form schema={verificationCodeSchema} submit={verifyCode}>
                <Input
                    type="number"
                    maxLength={6}
                    name="code"
                    placeholder="XXXXXX"
                    autoFocus
                />
                <button className="primary w-full mt-4">Verify</button>
            </Form>

            <div className="mt-4">
                <CodeCounter canTry={canTry} func={sendCode} />
                <p className="mt-4 text-sm text-zinc-500 text-center">Please check spam if you are unable to find the mail or check your email and try again.</p>
            </div>
        </>
    )

    return (
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
            <button type="submit" className="primary w-full">Continue</button>
        </Form>
    )
}

export default EmailVerifier;