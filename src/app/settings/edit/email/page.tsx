"use client";

import { Navbar } from "@components";
import { Form, Input, Password } from "@components/form";
import { LoadingSpinner } from "@components/ui";
import generateFingerprint from "@lib/auth/fingerprint";
import { updateEmail } from "@lib/helpers/mutations";
import { sendVerificationCode } from "@lib/helpers/server";
import { useCustomReducer } from "@lib/hooks";
import { emailUpdateSchema, verificationCodeSchema } from "@lib/schemas";
import { codetoError, getTimeInFuture } from "@lib/utils";
import useCurrentUser from "@store/user";
import { toast } from "sonner";

const Page = () => {
    const { user, isHydrated } = useCurrentUser();

    const { page, update, setter } = useCustomReducer({
        page: "update" as "update" | "verify",
        update: null as { email: string, passkey: string } | null
    });

    if (!isHydrated) return <LoadingSpinner />
    else if (!user) return null;

    const { email, emailUpdatedAt } = user;
    const canUpdate = Boolean(emailUpdatedAt && Date.now() > getTimeInFuture({ unit: "mo", from: emailUpdatedAt }))

    if (!canUpdate) return (
        <>
            <Navbar navTitle="Edit Email" />

            <p className="mt-4">You cannot update your email for now as it can only be updated once in a month. Please try again after a month.</p>
        </>
    )

    const submitEmailAndSendCode = async (data: { email: string, passkey: string }) => {

        const { success, errCode } = await sendVerificationCode(data.email, await generateFingerprint());
        if (!success) return codetoError(errCode);

        toast.success("Verification Code sent successfully");
        setter({ page: "verify", update: data });
    }

    const requestUpdate = async (data: { code: number }) => {
        if (!update) return;
        const { success, error } = await updateEmail({ ...data, ...update })
        if (!success) return error;
    }

    if (page === "verify") return (
        <>
            <Navbar navTitle="Edit Email" />
            <Form className="space-y-4" submit={requestUpdate} schema={verificationCodeSchema}>
                <Input
                    type="number"
                    maxLength={6}
                    name="code"
                    placeholder="XXXXXX"
                    autoFocus
                />
                <button className="primary w-full mt-4">Verify</button>
                <p>Please check spam or all email if you can{"'"}t find our email. If you still think you didn{"'"}t recieve an email from us, Please check your email or try again after an hour.</p>
            </Form>
        </>
    )

    return (
        <>
            <Navbar navTitle="Edit Email" />
            <Form className="space-y-4" defaultVals={{ email }} submit={submitEmailAndSendCode} schema={emailUpdateSchema}>
                <Input name="email" placeholder="Email" />
                <Password name="passkey" placeholder="Passkey" />
                <button type="submit" className="primary">Verify Email</button>

                <p>Email can be updated only once in a month. Your email help us identify you and help us keep you inform with importannt information through email. Make sure not to change your email unless it is necessary.</p>

            </Form>
        </>
    )
}

export default Page;