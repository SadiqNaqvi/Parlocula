"use client";

import { Navbar } from "@components";
import { Form, Input, Password } from "@components/form";
import { LoadingSpinner } from "@components/ui";
import { generateFingerprint } from "@lib/auth";
import { updateEmail } from "@lib/helpers/client";
import { sendVerificationCode } from "@lib/helpers/server";
import { useCustomReducer } from "@lib/hooks";
import { emailUpdateSchema, verificationCodeSchema } from "@lib/schemas";
import { codetoError, getTimeInFuture } from "@lib/utils";
import useCurrentUser from "@store/user";
import toast from "react-hot-toast";

const Page = () => {
    const { user, isHydrated, setUserHash } = useCurrentUser();

    const { page, update, setter } = useCustomReducer({
        page: 1,
        update: null as { email: string, passkey: string, encrypted: string } | null
    });

    if (!isHydrated) return <LoadingSpinner />
    else if (!user) return null;

    const { email, emailUpdatedAt } = user;
    const canUpdate = Boolean(emailUpdatedAt && Date.now() > getTimeInFuture({ unit: "mo", from: emailUpdatedAt }))

    const submitEmailAndSendCode = async (data: { email: string, passkey: string }) => {
        if (!canUpdate) return;

        const { success, errCode, result } = await sendVerificationCode(data.email, await generateFingerprint());
        if (!success) return codetoError(errCode);

        toast.success("Verificatio Code sent successfully");
        setter({ page: 2, update: { ...data, encrypted: result } });
    }

    const requestUpdate = async (data: { code: number }) => {
        if (!canUpdate || !update) return;
        return await updateEmail(user._id, { ...data, ...update }, setUserHash)
    }

    return (
        <>
            <Navbar navTitle="Edit Email" />
            {page === 1 ?
                (
                    <Form className="space-y-4" defaultVals={{ email }} submit={submitEmailAndSendCode} schema={emailUpdateSchema}>
                        <Input name="email" placeholder="Email" />
                        <Password name="passkey" placeholder="Passkey" />
                        <button type="submit" className="primary">Verify Email</button>

                        {canUpdate ?
                            <p>Email can be updated only once in a month. Your email help us identify you and help us keep you inform with importannt information through email. Make sure not to change your email unless it is necessary.</p>
                            :
                            <p>You cannot update your email for now. Please try again after a month.</p>
                        }
                    </Form>
                ) : (
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
                )
            }
        </>
    )
}

export default Page;