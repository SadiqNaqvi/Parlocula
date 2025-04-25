"use client";

import Register from "@components/auth/Register";
import EmailVerifier from "@components/auth/EmailVerifier";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkIfUserExist, login } from "@lib/helpers/client";
import { convertCodeIntoError } from "@lib/utils";
import useCurrentUser from "@store/user";

const Page = ({ searchParams }: { searchParams: { url?: string } }) => {
    const urlToRedirect = searchParams.url;
    const router = useRouter();
    const [email, setEmail] = useState('');
    const { setUserHash } = useCurrentUser();

    const findUser = async (email: string) => {
        router.prefetch(urlToRedirect ?? "/home");
        const { success, errCode, result } = await checkIfUserExist(email);
        if (!success) return convertCodeIntoError(errCode) as string;
        if (!result) {
            setEmail(email);
            return;
        }

        const err = await login(email, setUserHash);

        if (err) return err
        router.replace(urlToRedirect ?? "/home");
    }

    return (
        <>
            {email ?
                <Register email={email} />
                :
                <EmailVerifier callback={findUser} />
            }
        </>
    )
}

export default Page;