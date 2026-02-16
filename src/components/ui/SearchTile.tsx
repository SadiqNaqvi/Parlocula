import { getPoster } from "@lib/utils";
import { RefinedSearchData } from "@type/external";
import Navigate from "../Navigate";
import { GetPosterFunctionProps } from "@type/other";
import Image from "next/image";

export default function SearchTile({ id, image, media_type, name }: RefinedSearchData) {

    const mediaFilter = media_type === "person" ? "profile" : media_type === "movie" || media_type === "show" ? "poster" : "logo";

    const posterConfig = {
        external: true,
        path: image,
        type: mediaFilter,
        size: mediaFilter === "profile" ? "w185" : "w92"
    } as GetPosterFunctionProps<typeof mediaFilter>;

    return (
        <article className="w-full">
            <Navigate comp="link" className="h-full w-full flex gap-2 md:gap-4" goto={`/explore/${media_type === "tv" ? "show" : media_type}/${id}-${name.replaceAll(' ', '-')}`}>
                <Image
                    src={getPoster(posterConfig)}
                    className={`w-12 md:w-16 object-center aspect-square ${media_type === "person" ? "rounded-full object-cover " : media_type === "company" ? "object-contain" : "rounded-md object-cover"}`}
                    height={80}
                    width={80}
                    alt={`Poster of ${name}`}
                />
                <div className="flex-1 space-y-4">
                    <h4 className="sm:text-xl font-semibold line-clamp-1">{name}</h4>
                    <span className="text-xs sm:text-sm capitalize">{media_type === "tv" ? "show" : media_type}</span>
                </div>
            </Navigate>
        </article>
    )
}