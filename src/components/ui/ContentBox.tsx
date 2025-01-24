import { getPoster } from "@lib/dataRefiner";
import Link from "next/link";

export default function ContentBox({ img, title, detail, link }: { img: string | null, title: string, detail?: string, link: string }) {
    return (
        <>
            <figure className="h-48 aspect-square p-2 border border-[var(--gray40)] rounded-lg flex flex-col flex-cntr-around">
                <img src={img ? getPoster("profile", img, 1) : ''} alt='' className="loadingAnimation object-cover h-20 aspect-square rounded-full" />
                <figcaption>
                    <Link href={link} className="font-medium text-center text-lg line-clamp-2">{title}</Link>
                    <p className="text-sm line-clamp-1 text-gray-500 text-center">{detail}</p>
                    <p className="text-xs line-clamp-1 text-gray-500 text-center">10 Episodes</p>
                </figcaption>
            </figure>
        </>
    )
}