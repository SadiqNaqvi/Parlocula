import { refineString } from "@lib/dataRefiner"
import { getInternalPoster } from "@lib/utils"
import { MereThread } from "@type/internal"
import Image from "next/image"
import Navigate from "../Navigate"

const options = {
    aspect_ratio: '1.0',
    crop: 'fill',
    width: '80',
}

const ThreadTile = ({ name, description, poster, _id }: MereThread) => {
    return (
        <Navigate role="button" comp="link" goto={`t/${_id}-${refineString(name)}`}>
            <article className="flex gap-4 p-3 rounded-md border border-gray30">
                <Image
                    className="size-20 rounded-xl object-cover"
                    src={getInternalPoster({ path: poster, options })}
                    alt="Poster"
                    loading="lazy"
                    width={80} height={80}
                />
                <section className="space-y-1">
                    <h3 className="font-semibold text-xl line-clamp-1">{name}</h3>
                    <p className="line-clamp-2 text-zinc-500 text-sm">{description}</p>
                    <div className="space-x-4 text-sm text-zinc-500">
                        <span> 10K Members</span>
                        <span> 1K Posts</span>
                    </div>
                </section>
            </article>
        </Navigate>
    )
}

export default ThreadTile;