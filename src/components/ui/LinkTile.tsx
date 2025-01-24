import Image from "next/image"
import Link from "next/link"
import placeholder from "@assets/placeholder.png"

const LoadingLinkTile = () => (
    <div className="p-3 w-full flex gap-3 border border-gray20 rounded-md">
        <div className="size-16 rounded-md skeletonLoading"></div>
        <div className="flex-1">
            <div className="w-[60%] h-5 rounded-xl skeletonLoading"></div>
            <div className="w-[80%] h-2 mt-3 skeletonLoading rounded-xl"></div>
            <div className="w-[60%] h-2 mt-1 skeletonLoading rounded-xl"></div>
        </div>
    </div>
)

const LinkTile = ({ link, title, logo }: { link: string, title: string, logo: string | null }) => {
    return (
        <Link href={link} role="button" className="w-fit">
            <article className="flex p-3 gap-4 border border-gray20 rounded-md bg-gray10">
                <Image
                    src={logo || placeholder}
                    alt={title + " logo"}
                    className="size-8 object-cover rounded-md"
                    height={32}
                    width={32}
                    loading="lazy" />
                <div>
                    <h3 className="text-lg line-clamp-1">{title}</h3>
                </div>
            </article>
        </Link>
    )
}

export default LinkTile;
export { LoadingLinkTile };