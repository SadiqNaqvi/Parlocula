import Navbar from "@components/Navbar";
import { OptionalChildren } from "@components/ui";
import Link from "next/link";

const LoginModal = ({ redirectTo, title, skipFullScreen }: { redirectTo?: string, title?: string, skipFullScreen?: boolean }) => {

    return (
        <div className={`flex flex-col flex-cntr-all ${skipFullScreen ? "h-stretch" : "h-size-screen"}`}>
            <OptionalChildren condition={!skipFullScreen}>
                <Navbar navTitle={title} />
            </OptionalChildren>

            <section className="m-auto space-y-4">

                <h1 className="font-semibold text-lg md:text-2xl text-center">Hello Guest 👋</h1>

                <ul className="space-y-2">
                    <li className="text-center">This is a private page, personalized and curated for each individual user.</li>
                    <li className="text-center">You can either log-in and enjoy this page</li>
                    <li className="text-sm text-zinc-500 text-center">or</li>
                    <li className="text-center text-sm text-zinc-500">You can go back and enjoy the app as a guest.</li>
                </ul>

                <Link
                    href={`/join${redirectTo ? `?url=${redirectTo}` : ''}`}
                    className="primary btn max-w-80 mx-auto">
                    Log-in
                </Link>
            </section>

        </div>
    )

}

export default LoginModal;