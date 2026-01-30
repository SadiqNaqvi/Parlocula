import { getPoster } from "@lib/utils";
import Image from "next/image";
import { Navigate } from "@components";

export default function ArtistCard({ img, title, detail, link }: { img: string | null, title: string, detail?: string, link: string }) {
    return (
        <Navigate goto={link} comp="link">
            <figure className="size-48 p-2 border border-gray40 rounded-lg flex flex-col flex-cntr-around">

                <Image
                    height={80}
                    width={80}
                    src={getPoster({ external: true, type: "profile", path: img, size: "w185" })}
                    alt={`Picture of ${title}`}
                    className="object-cover size-20 rounded-full" />

                <figcaption>

                    <h4 className="font-medium text-center line-clamp-2">{title}</h4>

                    <p className="text-sm line-clamp-1 text-zinc-500 text-center">{detail}</p>
                </figcaption>
            </figure>
        </Navigate>
    )
}