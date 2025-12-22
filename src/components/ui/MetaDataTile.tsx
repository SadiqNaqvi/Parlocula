import { timeAgo } from "@lib/utils"
import { GenericDate } from "@type/internal"

const MetadataTile = ({ createdAt, editedAt, nsfw, spoiler }: { createdAt?: GenericDate, editedAt?: GenericDate, nsfw?: boolean, spoiler?: boolean }) => {
    return (
        <ul className="flex gap-2 overflow-x-auto noScroll">
            {createdAt && (
                <>
                    <li className="text-xs sm:text-sm text-zinc-500">
                        {timeAgo(createdAt)}
                    </li>
                </>
            )}
            {editedAt && (
                <li className="text-xs sm:text-sm" title={new Date(editedAt).toDateString()}>
                    Edited
                </li>
            )}
            {nsfw && (
                <li className="bg-violet-500 bg-opacity-20 rounded-md text-xs sm:text-sm px-2 py-1">
                    NSFW
                </li>
            )}
            {spoiler && (
                <li className="bg-orange-500 bg-opacity-20 rounded-md text-xs sm:text-sm px-2 py-1">
                    Spoiler
                </li>
            )}
        </ul>
    )
}

export default MetadataTile;