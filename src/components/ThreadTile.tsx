import { getInternalPoster } from "@lib/utils"
import Image from "next/image"
import placeholder from "@assets/placeholder.png"
import Navigate from "./Navigate"
import { refineString } from "@lib/dataRefiner"
import { MereThread } from "@type/internal"

const poster_options = {
    aspect_ratio: '1.0',
    crop: 'fill',
    width: '80',
}

const ThreadTile = ({ title, description, poster, _id }: MereThread) => {
    return (
        <Navigate role="button" comp="link" goto={`/threads/${_id}-${refineString(title)}`}>
            <article className="flex gap-4 p-3">
                <Image
                    className="size-20 rounded-xl object-cover"
                    src={poster ? getInternalPoster(poster, poster_options) : placeholder}
                    alt="Poster"
                    loading="lazy"
                    width={80} height={80}
                />
                <section className="space-y-1">
                    <h3 className="font-semibold text-xl line-clamp-1">{title}</h3>
                    <p className="line-clamp-2 text-zinc-500 text-sm">{description}</p>
                </section>
            </article>
        </Navigate>
    )
}

export default ThreadTile;