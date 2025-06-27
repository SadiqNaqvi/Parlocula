import { getPoster, numberConverter, refineString } from "@lib/utils"
import { MereThread } from "@type/internal"
import Image from "next/image"
import Navigate from "../Navigate"

const ThreadTile = ({ name, poster, _id, member_count, post_count }: MereThread) => {
    return (
        <Navigate role="button" comp="link" goto={`t/${_id}-${refineString(name)}`}>
            <article className="flex gap-4 p-3 rounded-md border border-gray30">
                <Image
                    className="size-10 rounded-full object-cover"
                    src={getPoster({ path: poster })}
                    alt="Poster"
                    loading="lazy"
                    width={40} height={40}
                />
                <section className="space-y-1">
                    <h3 className="font-semibold line-clamp-1">{name}</h3>
                    <div className="space-x-4 text-sm text-zinc-500">
                        <span> {numberConverter(member_count)} Members</span>
                        <span> {numberConverter(post_count)} Posts</span>
                    </div>
                </section>
            </article>
        </Navigate>
    )
}

export default ThreadTile;