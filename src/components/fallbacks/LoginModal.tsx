import Navbar from "@components/Navbar";
import Link from "next/link";

const LoginModal = ({ redirectTo, title, skipFullScreen }: { redirectTo?: string, title?: string, skipFullScreen?: boolean }) => {

    return (
        <div className={`flex flex-col ${skipFullScreen ? "h-size-screen" : "h-stretch"}`}>
            <Navbar navTitle={title} />

            <section className="m-auto max-w-80">

                <h1 className="font-semibold text-lg mb-4">Hello Guest 👋</h1>

                <ul className="space-y-2">
                    <li className="text-center">You{"'"}ve arrived at a non-guest page.</li>
                    <li className="text-center">This page is personalized and curated for each individual user.</li>
                    <li className="text-center">You can also enjoy this page once you{"'"}ve logged-in.</li>
                    <li className="text-center text-sm text-zinc-500">You can go back and enjoy the app as a guest.</li>
                </ul>

                <Link
                    href={`/join${redirectTo ? `?url=${redirectTo}` : ''}`}
                    className="primary btn">
                    Log-in
                </Link>
            </section>

        </div>
    )

}

export default LoginModal;