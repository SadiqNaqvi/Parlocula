import { Navigate } from "@components";
import ParloImage from "./ParloImage";

export default function ArtistCard({ img, title, detail, link }: { img: string | null, title: string, detail?: string, link: string }) {
    return (
        <Navigate
            historyPayload={{
                title,
                poster: img ?? undefined
            }}
            goto={link}
            comp="link">
            <figure className="size-48 p-2 border border-gray40 rounded-lg flex flex-col flex-cntr-around">

                <ParloImage
                    size={80}
                    frame={img || undefined}
                    frameType="profile"
                    alt={`Picture of ${title}`}
                    className="object-cover min-w-20 size-20 rounded-full" />

                <figcaption>

                    <h4 className="font-medium text-center line-clamp-2">{title}</h4>

                    <p className="text-sm line-clamp-1 text-zinc-500 text-center">{detail}</p>
                </figcaption>
            </figure>
        </Navigate>
    )
}