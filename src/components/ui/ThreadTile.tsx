import { getPoster, numberConverter, makeUrlSafe } from "@lib/utils"
import { MereThread } from "@type/internal"
import Image from "next/image"
import Navigate from "../Navigate"
import ParloImage from "./ParloImage"

const ThreadTile = ({ name, poster, _id, member_count, post_count }: MereThread) => {
    return (
        <Navigate role="button" comp="link" goto={`/thread/${_id}-${makeUrlSafe(name)}`}>
            <article className="flex gap-4 p-3 rounded-md border border-gray30">
                <ParloImage
                    className="size-10 rounded-full object-cover"
                    frame={poster}
                    alt="Poster"
                    size={40}
                />
                <section className="space-y-1">
                    <h3 className="font-semibold line-clamp-1">{name}</h3>
                    <div className="space-x-4 text-sm text-zinc-500">
                        {member_count && <span> {numberConverter(member_count)} Members</span>}
                        {post_count && <span> {numberConverter(post_count)} Posts</span>}
                    </div>
                </section>
            </article>
        </Navigate>
    )
}

export default ThreadTile;