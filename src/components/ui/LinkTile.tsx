import { LinkIcon } from "@assets/Icons"
import { LinkModelType } from "@type/model"
import Link from "next/link"

const LinkTile = ({ label, path }: LinkModelType) => {
    return (
        <Link href={path}
            className="w-fit px-4 py-2 rounded-md bg-gray-500 bg-opacity-30 text-sky-400">
            <LinkIcon className="size-4" />
            <span>{label}</span>
        </Link>
    )
}

export default LinkTile;