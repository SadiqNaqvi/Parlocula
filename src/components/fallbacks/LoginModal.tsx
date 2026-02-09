import Navbar from "@components/Navbar";
import { OptionalChildren } from "@components/ui";
import Link from "next/link";

type Props = {
    redirectTo?: string,
    title?: string,
    skipFullScreen?: boolean,
    heading?: string;
    desc?: string[];
}

const DescriptionSection = () => (
    <ul className="space-y-1">
        <li className="text-center">This is personalized and curated for each individual user.</li>
        <li className="text-center">You can either log-in and enjoy this</li>
        <li className="text-sm text-zinc-500 text-center">or</li>
        <li className="text-center text-sm text-zinc-500">You can go back and enjoy the app as a guest.</li>
    </ul>

)

const LoginModal = ({ redirectTo, title, skipFullScreen, desc, heading }: Props) => {

    return (
        <div className={`flex flex-col flex-cntr-all ${skipFullScreen ? "h-stretch" : "h-size-screen"}`}>
            <OptionalChildren condition={!skipFullScreen}>
                <Navbar navTitle={title} />
            </OptionalChildren>

            <section className="m-auto space-y-4">

                <h1 className="font-semibold text-lg md:text-2xl text-center">{heading || "Hello Guest 👋"}</h1>

                <OptionalChildren condition={desc?.length} fallback={<DescriptionSection />}>
                    <ul className="space-y-1 text-sm text-zinc-500">
                        {desc?.map((description, i) => (
                            <li key={i} className="text-center">{description}</li>
                        ))}
                    </ul>
                </OptionalChildren>

                <Link
                    href={`/join${redirectTo ? `?url=${redirectTo}` : ''}`}
                    className="primary btn max-w-80 mx-auto">
                    Log-in
                </Link>
            </section>

        </div >
    )

}

export default LoginModal;