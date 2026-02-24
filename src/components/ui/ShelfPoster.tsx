import { CollectionIcon, EyesIcon, HeartIcon, StarIcon } from "@assets/Icons";
import { AllShelves } from "@type/models";
import { twMerge } from "tailwind-merge";
import ParloImage from "./ParloImage";

const ShelfPosterIcons = ({ type, className }: { type: AllShelves, className?: string }) => {

    if (type === "favourite") return (
        <div className={twMerge("rounded-full size-full flex flex-cntr-all bg-gray10", className)}>
            <HeartIcon className="text-pink-500 size-full max-w-16" />
        </div>
    );

    else if (type === "recommended") return (
        <div className={twMerge("rounded-full size-full flex flex-cntr-all bg-gray10", className)}>
            <StarIcon className="text-purple-500 size-full max-w-16" />
        </div>
    );

    else if (type === "watched") return (
        <div className={twMerge("rounded-full size-full flex flex-cntr-all bg-gray10", className)}>
            <EyesIcon className="text-orange-500 size-full max-w-16" />
        </div>
    );

    else return (
        <div className={twMerge("rounded-full size-full flex flex-cntr-all bg-gray10", className)}>
            <CollectionIcon className="text-sky-500 size-full max-w-16" />
        </div>
    );
};

type Props = {
    poster: string | undefined,
    shelf_type: AllShelves,
    bigSize?: boolean;
    name: string,
    className?: string,
    iconsClassName?: string,
    useClassNameForBoth?: boolean,
    fancy?: boolean,
}

const smallSizeClass = "min-w-12 size-12";
const bigSizeClass = "min-w-20 size-20 sm:size-32 sm:min-w-32";

const ShelfPoster = ({ fancy, poster, shelf_type, name, className, iconsClassName, bigSize, useClassNameForBoth }: Props) => {

    if (poster) return (
        <ParloImage
            fancyGallery={fancy ? "poster" : undefined}
            frameType="shelfPoster"
            className={twMerge("object-cover rounded-full", bigSize ? bigSizeClass : smallSizeClass, className)}
            size={bigSize ? 128 : 48}
            sizes={bigSize ? [
                { imageWidth: 80, maxScreenWidth: 480 },
                { imageWidth: 128 }
            ] : undefined}
            prioritize={bigSize}
            alt={`Poster of shelf ${name}`}
            frame={poster}
        />
    )

    return (
        <ShelfPosterIcons className={twMerge(bigSize ? `${bigSizeClass} p-6` : smallSizeClass, useClassNameForBoth ? className : "", iconsClassName)} type={shelf_type} />
    )

}

export default ShelfPoster;