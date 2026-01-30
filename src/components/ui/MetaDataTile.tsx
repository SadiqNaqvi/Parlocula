import { createArray, timeAgo } from "@lib/utils"
import { GenericDate } from "@type/internal"
import OptionalChildren from "./OptionalChildren"
import { twMerge } from "tailwind-merge"

type Props = {
    createdAt?: GenericDate,
    editedAt?: GenericDate,
    nsfw?: boolean,
    spoiler?: boolean,
    others?: { value: React.ReactNode, className?: string, condition?: any }[]
}

type ListType = {
    value: string | undefined,
    className?: string | undefined,
    args?: Record<string, any>,
    condition?: string | number | boolean | Date
}

const isNonNullable = <T,>(prop: T): prop is NonNullable<T> => {
    return Boolean(prop === undefined || prop === null) ? false : true;
}

const MetadataTile = ({ createdAt, editedAt, nsfw, spoiler, others }: Props) => {

    const metadatas = createArray<ListType>([
        { value: timeAgo(createdAt) },
        { value: "Edited", args: { title: new Date(editedAt || "").toDateString() }, condition: editedAt ?? false },
        { value: "NSFW", className: "px-2 py-1 text-zinc-50 bg-gray-500 bg-opacity-20", condition: nsfw ?? false },
        { value: "Spoiler", className: "px-2 py-1 text-zinc-50 bg-gray-500 bg-opacity-20", condition: spoiler ?? false },
    ]).concatConditionally(others);

    return (
        <ul className="flex gap-2 items-center overflow-x-auto noScroll">
            {metadatas.map(({ value, args, className, condition }, i) => {
                { condition ? console.log(condition, value, i) : "" }

                return (
                    <OptionalChildren key={i} condition={condition ?? value}>
                        <li
                            {...(args || {})}
                            className={twMerge("text-xs sm:text-sm text-zinc-500 rounded-md", className)}
                        >
                            {value}
                        </li>
                    </OptionalChildren>
                )
            })}
            {/* <OptionalChildren condition={createdAt}>
                <li className="text-xs sm:text-sm text-zinc-500">
                    {timeAgo(createdAt)}
                </li>
            </OptionalChildren>
            <>
            </>
            )}
            {editedAt && (
                <li className="text-xs sm:text-sm">
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
            )} */}
        </ul>
    )
}

export default MetadataTile;