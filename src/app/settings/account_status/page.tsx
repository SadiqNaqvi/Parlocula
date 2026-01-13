import { Navbar } from "@components";
import { getUserFromToken } from "@lib/auth/utils";
import { TokenPayload } from "@type/internal";
import { cookies } from "next/headers";

const AccountStatusPage = async ({ banEndsAt, isBanned }: Pick<TokenPayload, "isBanned" | "banEndsAt">) => {

    const user = getUserFromToken(await cookies());

    if (!user) return null;

    if (isBanned && banEndsAt) return (
        <>
            <Navbar navTitle="Account Status" />

            <section>
                <h3 className="text-red-500 text-center">Your account is Temporary Banned</h3>
                <ul className="my-4 space-y-2">
                    <li className="text-center">
                        In this while, you can only view content on this app like a guest but cannot do anything.
                    </li>
                    <li className="text-center">
                        This is your time to learn from your mistakes and try not to repeat them.
                    </li>
                    <li className="text-center">
                        Further mistakes can lead to permanent banned. Please take care about this.
                    </li>
                </ul>

                <p className="text-sm text-zinc-500">Your Banned will end on {new Date(banEndsAt).toDateString()}</p>

            </section>
        </>

    )

    return (
        <>
            <Navbar />
            <section>
                <h3 className="text-green-500 text-center">Your account is fine.</h3>
                <p className="text-center">Enjoy your time on Parlocula.</p>
            </section>
        </>
    )

}

export default AccountStatusPage;