import { CollectionIcon, EyesIcon, HeartIcon, StarIcon } from "@assets/Icons";
import { getPoster } from "@lib/utils";
import { AllShelves } from "@type/models";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

const ShelfPosterIcons = ({ type, className }: { type: AllShelves, className?: string }) => {
    if (type === "favourite")
        return (
            <div className={twMerge("rounded-full size-full flex flex-cntr-all bg-pink-500 bg-opacity-30", className)}>
                <HeartIcon className="text-pink-500 size-full max-w-20" />
            </div>
        );
    else if (type === "recommended")
        return (
            <div className={twMerge("rounded-full size-full flex flex-cntr-all bg-purple-500 bg-opacity-30", className)}>
                <StarIcon className="text-purple-500 size-full max-w-20" />
            </div>
        );
    else if (type === "watched")
        return (
            <div className={twMerge("rounded-full size-full flex flex-cntr-all bg-orange-500 bg-opacity-30", className)}>
                <EyesIcon className="text-orange-500 size-full max-w-20" />
            </div>
        );
    else return (
        <div className={twMerge("rounded-full size-full flex flex-cntr-all bg-sky-500 bg-opacity-30", className)}>
            <CollectionIcon className="text-sky-500 size-full max-w-20" />
        </div>
    );
};

const ShelfPoster = ({ poster, shelf_type, name, className, iconsClassName }: { poster: string | undefined, shelf_type: AllShelves, name: string, className?: string, iconsClassName?: string }) => {

    if (poster) return (
        <Image
            className={twMerge("min-w-12 size-12 object-cover rounded-full", className)}
            height={48} width={48}
            alt={`Poster of shelf ${name}`}
            src={getPoster({ external: true, path: poster, type: "poster", size: "w185" })}
        />
    )

    return (
        <ShelfPosterIcons className={twMerge("size-12", iconsClassName)} type={shelf_type} />
    )

}

export default ShelfPoster;