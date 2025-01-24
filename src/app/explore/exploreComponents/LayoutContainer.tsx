import Image from "next/image";
import Navbar from "./Navbar";
import { getPoster } from "@lib/dataRefiner";

export default function LayoutContainer({ backdrop, poster, poster_type, poster_classname, children, classnames = "" }: { backdrop: string, poster: string, poster_type: string, poster_classname: string, children: React.ReactNode, classnames?: string }) {
    return (
        <>
            <Navbar />
            <header>
                <div className="h-40 md:h-60 bg-gray-500 background-all" style={backdrop ? { backgroundImage: `url(${getPoster("backdrop", backdrop, 3)})` } : undefined}></div>
                <section className="max-w-screen-lg mx-auto px-4 bg-primary border-b border-gray30 rounded-t-2xl pb-6">
                    <Image className={`w-20 md:w-40 ml-2 md:ml-0 aspect-square border-4 border-primary ${poster_classname} rounded-full translate-y-[-50%] bg-zinc-500`} src={getPoster(poster_type, poster, 2)} alt="" height={500} width={500} />
                    <div className={"-mt-8 md:-mt-14 " + classnames}>{children}</div>
                </section>
            </header>
        </>
    )
}