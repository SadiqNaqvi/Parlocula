import { makeUrlSafe, numberConverter } from "@lib/utils"
import { MereThread } from "@type/internal"
import { Navigate } from "@components"
import { OptionalChildren, ParloImage } from "@components/ui"

const ThreadTile = ({ name, poster, _id, member_count, post_count }: MereThread) => {
    return (
        <Navigate role="button" comp="link" goto={`/thread/${_id}-${makeUrlSafe(name)}`}>
            <article className="flex gap-2 items-center p-2 sm:px-4">
                <ParloImage
                    frameType="threadPoster"
                    className="min-w-10 size-10 rounded-full object-cover"
                    frame={poster}
                    alt="Poster"
                    size={40}
                />
                <section className="space-y-1">
                    <h3 className="font-semibold line-clamp-1">{name}</h3>
                    <div className="space-x-2 text-sm text-zinc-500">
                        <OptionalChildren condition={member_count}>
                            <span> {numberConverter(member_count)} Members</span>
                        </OptionalChildren>
                        <OptionalChildren condition={post_count}>
                            <span> {numberConverter(post_count)} Posts</span>
                        </OptionalChildren>
                    </div>
                </section>
            </article>
        </Navigate>
    )
}

export default ThreadTile;