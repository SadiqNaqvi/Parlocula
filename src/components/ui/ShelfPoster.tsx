import { CollectionIcon, EyesIcon, HeartIcon, StarIcon } from "@assets/Icons";
import { getPoster } from "@lib/utils";
import { AllShelves } from "@type/models";
import { twMerge } from "tailwind-merge";
import ParloImage from "./ParloImage";

const ShelfPosterIcons = ({ type, className }: { type: AllShelves, className?: string }) => {

    if (type === "favourite") return (
        <div className={twMerge("rounded-full size-full flex flex-cntr-all bg-gray10", className)}>
            <HeartIcon className="text-pink-500 size-full max-w-20" />
        </div>
    );

    else if (type === "recommended") return (
        <div className={twMerge("rounded-full size-full flex flex-cntr-all bg-gray10", className)}>
            <StarIcon className="text-purple-500 size-full max-w-20" />
        </div>
    );

    else if (type === "watched") return (
        <div className={twMerge("rounded-full size-full flex flex-cntr-all bg-gray10", className)}>
            <EyesIcon className="text-orange-500 size-full max-w-20" />
        </div>
    );

    else return (
        <div className={twMerge("rounded-full size-full flex flex-cntr-all bg-gray10", className)}>
            <CollectionIcon className="text-sky-500 size-full max-w-20" />
        </div>
    );
};

type Props = {
    poster: string | undefined,
    shelf_type: AllShelves,
    name: string,
    className?: string,
    iconsClassName?: string,
    useClassNameForBoth?: boolean,
    fancy?: boolean,
}

const ShelfPoster = ({ poster, shelf_type, name, className, iconsClassName, useClassNameForBoth }: Props) => {

    if (poster) return (
        <ParloImage
            fancy={{
                gallery: "poster",
                fullSizePath: getPoster({ external: true, path: poster, type: "poster", size: "original" })
            }}
            className={twMerge("min-w-12 size-12 object-cover rounded-full", className)}
            height={48} width={48}
            alt={`Poster of shelf ${name}`}
            loader={({ src }) => src}
            frame={getPoster({ external: true, path: poster, type: "poster", size: "w342" })}
        />
    )

    return (
        <ShelfPosterIcons className={twMerge("size-12", useClassNameForBoth ? className : "", iconsClassName)} type={shelf_type} />
    )

}

export default ShelfPoster;