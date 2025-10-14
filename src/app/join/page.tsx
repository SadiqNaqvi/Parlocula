"use client";

import { Navigate } from "@components";
import EmailVerifier from "@components/auth/EmailVerifier";
import Register from "@components/auth/Register";
import { login } from "@lib/helpers/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Page = ({ searchParams }: { searchParams: { url?: string } }) => {
    const urlToRedirect = searchParams.url;
    const router = useRouter();
    const [email, setEmail] = useState('');

    const handleLogin = async (email: string, code: number) => {
        const { errCode, success } = await login(email, code);

        if (!success && errCode === "unregistered_user")
            setEmail(email);
        else if (!success) return errCode;

        router.replace(urlToRedirect ?? "/home");
    }

    if (email) return <Register email={email} />

    return (
        <>
            <EmailVerifier callback={handleLogin} />

            <div className="mt-4 flex flex-col">
                <p className="text-sm text-center text-zinc-500">Feels like someone else is using your account?</p>
                <Navigate className="mx-auto" comp="link" goto="invalidate">Log out everyone</Navigate>
            </div>
        </>
    )
}

export default Page;