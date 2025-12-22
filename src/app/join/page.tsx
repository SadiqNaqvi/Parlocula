"use client";

import Register from "@app/join/Register";
import { Navigate } from "@components";
import EmailVerifier from "@components/auth/EmailVerifier";
import { urlPattern } from "@lib/constants";
import { loginUserMutation } from "@lib/helpers/mutations";
import { useNavigation } from "@store/historystack";
import { useState } from "react";

const Page = ({ searchParams }: { searchParams: { url?: string } }) => {
    const urlToRedirect = searchParams.url;
    const navigation = useNavigation();
    const [email, setEmail] = useState('');

    const handleLogin = async (email: string, code: number) => {
        const response = await loginUserMutation({ email, code });

        const redirectTo = urlToRedirect && urlPattern.test(urlToRedirect) ? urlToRedirect : "/home";

        if (!response) return navigation.replace(redirectTo);

        if (typeof response === "string" && response === "unregistered_user")
            setEmail(email);

        return response;
    }

    if (email) return <Register email={email} />

    return (
        <>
            <EmailVerifier callback={handleLogin} />

            <div className="mt-6 flex flex-col">
                <p className="text-sm text-center text-zinc-500">Feels like someone else is using your account?</p>
                <Navigate className="mx-auto" comp="link" goto="invalidate">Log out everyone</Navigate>
            </div>
        </>
    )
}

export default Page;