"use client";

import { Navbar } from "@components";
import EmailVerifier from "@components/auth/EmailVerifier";
import { DatePicker, Form, Input } from "@components/form";
import { errorCodes } from "@lib/constants";
import { invalidateSession } from "@lib/helpers/client";
import { verifyCode } from "@lib/helpers/server";
import { sessionInvalidationSchema } from "@lib/schemas";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

const InvalidateSection = ({ email }: { email: string }) => {

    const router = useRouter();

    const performInvalidation = async (data: { passKey: string, date?: number }) => {
        const { success, errCode, formError } = await invalidateSession({ ...data, email })
        if (success) {
            toast.success("Invalidation Successfull");
            router.push("/join");
        }
        else if (formError) return formError;
        else errorCodes[errCode]?.message ||
            "Something went wrong! Please try again."
    }

    return (
        <>
            <Navbar />

            <p className="text-sm my-4 text-zinc-500 text-center">
                You need to enter your PassKey to perform this action. This PassKey has been sent to you with your welcome email.
            </p>

            <Form submit={performInvalidation} schema={sessionInvalidationSchema}>

                <Input placeholder="PassKey" name="passKey" />

                <DatePicker
                    name="date"
                    description="Optional"
                />
            </Form>

            <ul className="mt-2 text-zinc-500 text-sm space-y-1">
                <li>
                    Parlocula supports Time-based reversion.
                    This means you can revert your account upto a specified time in the past.
                </li>
                <li>
                    All the documents 'created' within this time range will be deleted example: Posts, Threads, Lists, Rooms, Messages, etc.
                </li>
                <li>
                    Your account would start looking like how it was before the specified time.
                </li>
                <li>
                    For now we only support one month time range.
                </li>
                <li className="text-red-500">
                    This action cannot be undone. So be sure before you choose this.
                </li>

            </ul>
        </>
    )


}

const InvalidatePage = () => {
    const [email, setEmail] = useState("");

    const verifyEmail = async (email: string, code: number) => {
        const { success, errCode, formError } = await verifyCode(code);

        if (success) setEmail(email);

        else if (formError) return formError;

        else return errCode;
    }

    if (!email) return (
        <>
            <Navbar navTitle="Invalidate Session" />
            <p className="text-sm my-4 text-zinc-500 text-center">
                If you feel like someone has access to your account, you can invalidate your session. Within 10 minuets, everyone will be log-out of your account.
            </p>
            <EmailVerifier callback={verifyEmail} />
        </>
    )

    return <InvalidateSection email={email} />


}

export default InvalidatePage;