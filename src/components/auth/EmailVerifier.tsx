"use client"

import { Form, Input } from "@components/form";
import { FormSubmitReturnType } from "@components/form/Form";
import Navbar from "@components/Navbar";
import { generateFingerprint } from "@lib/auth";
import { sendVerificationCode } from "@lib/helpers/server";
import { useCustomReducer } from "@lib/hooks";
import appToast from "@lib/providers/toast";
import { emailSchema, verifyCodeToLoginSchema } from "@lib/schemas";
import { codetoError, getTimeInFuture } from "@lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const schema = z.object({
    email: emailSchema,
});

const CodeCounter = ({ canResend, func }: { canResend: boolean, func: () => void }) => {

    const [canSend, setCanSend] = useState(true);

    const callFunc = () => {
        func();
        setCanSend(false);
        setTimeout(() => setCanSend(true), 2000 * 60)
    }

    if (!canResend) return (
        <p className="text-sm text-center">You{"'"}ve reached the limit to send verifiction codes for now. Please try again after an hour.</p>
    )

    else if (canSend) return (
        <button className="text-center smallBtn mx-auto" onClick={callFunc}>Resend code</button>
    )

    else return <p className="text-sm text-center text-slate-500">You can resend an code in 2 mins.</p>
}

const toastIt = (message: string, type: "success" | "error") => {
    if (type === "success") {
        appToast.success(message)
        return true;
    }
    appToast.error(message)
    return false;
}

const EmailVerifier = ({ callback }: { callback: (email: string, code: number) => Promise<FormSubmitReturnType> }) => {

    const { email, page, canResend, sentAt, tries, setter } = useCustomReducer({
        email: "", page: "email", tries: 0, sentAt: null as Date | null, canResend: true
    });

    const verifyCode = async ({ code }: { code: number }) => {
        if (tries >= 3)
            return "You've reached the limit to verify your email. Please try again in an hour.";

        else if (sentAt && (Date.now() > getTimeInFuture({ unit: "m", from: sentAt, timeVal: 5 })))
            return "Code expired. Please re-send a verification code or try again in an hour.";

        const errCode = await callback(email, code);
        if (errCode === "invalid_verification_code")
            setter({ tries: tries + 1 });

        return errCode;
    }

    const sendCode = async (input?: string) => {

        const emailToSend = input ?? email;
        const response = await sendVerificationCode(emailToSend, await generateFingerprint());

        if (response.success) {
            setter({ sentAt: new Date() });
            return toastIt("Verification Email sent successfully", "success");
        }

        else if (response.errCode === "email_verification_limit_exceed") {
            setter({ canResend: false });
            return toastIt("Too many attempts. Please try again after an hour.", "error")
        }

        return toastIt(codetoError(response.errCode), "error");
    }

    const submit = async (data: { email: string }) => {
        const { email } = data;
        const done = await sendCode(email);
        if (done) setter({ email, page: "verification" });

    }

    if (page === "verification") return (
        <>
            <Navbar navTitle="Verify Your Email" onGoBack={() => setter({ page: "email" })} />

            <p className="mb-8 text-center text-sm text-zinc-500">Enter 6 digit verification code that has been sent to your email {email}.</p>

            <Form schema={verifyCodeToLoginSchema} submit={verifyCode}>
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
                <CodeCounter canResend={canResend} func={sendCode} />
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
            <button type="submit" className="primary mt-auto w-full">Continue</button>
        </Form>
    )
}

export default EmailVerifier;