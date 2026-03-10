"use client";

import Register from "@app/join/Register";
import { Navigate } from "@components";
import EmailVerifier from "@components/auth/EmailVerifier";
import { urlPattern } from "@lib/constants";
import { loginUserMutation } from "@lib/helpers/mutations";
import { useNavigation } from "@store/historystack";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

const Page = () => {
    const urlToRedirect = useSearchParams().get("url");
    const navigation = useNavigation();
    const [email, setEmail] = useState('');

    const handleLogin = async (email: string, code: number) => {
        const response = await loginUserMutation({ email, code });

        const redirectTo = urlToRedirect && urlPattern.test(urlToRedirect) ? urlToRedirect : "/home";

        if (response.success) {
            navigation.replace(redirectTo);
        }

        else if (response.error === "unregistered_user") {
            setEmail(email);
        }
        
        else return response.error;
    }

    if (email) return <Register email={email} />

    return (
        <>
            <EmailVerifier
                navTitle="Welcome"
                callback={handleLogin} />

            <div className="mt-6 text-center space-x-2 space-y-2">
                <p className="inline text-sm text-center text-zinc-500">Feels like someone else is using your account?</p>
                <Navigate className="inline text-sm" comp="link" goto="invalidate">Log out everyone</Navigate>
            </div>
        </>
    )
}

export default Page;