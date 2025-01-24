"use client";

import Register from "@components/auth/Register";
import EmailVerifier from "@components/auth/EmailVerifier";
import { useState } from "react";
import { checkIfUserExist } from "@lib/actions";
import useCurrentUser from "@store/user";
import { useRouter } from "next/navigation";
import { User } from "@type/internal";

const Page = ({ searchParams }: { searchParams: { url?: string } }) => {
    const urlToRedirect = searchParams.url;
    const router = useRouter();
    const [email, setEmail] = useState('');
    const { setUserHash } = useCurrentUser();

    const storeUserAndRedirect = (user: User) => {
        setUserHash(user);
        router.replace(urlToRedirect ?? "/home");
    }

    const findUser = async (email: string) => {
        router.prefetch(urlToRedirect ?? "/home");
        const res = await checkIfUserExist(email);
        if (!res.success) return res.error;
        if (!res.result) {
            setEmail(email);
            return;
        }


        const resp = await fetch(`${process.env.__NEXT_PRIVATE_ORIGIN || ""}/api/login?email=${email}`, { next: { revalidate: 0 } });

        const response = await resp.json();
        if (!response.success) return response.error
        storeUserAndRedirect(response.result);
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