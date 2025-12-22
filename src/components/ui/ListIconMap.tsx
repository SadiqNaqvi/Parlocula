import { EyesIcon, HeartIcon, ThumbUpIcon } from "@assets/Icons";
import { PredefinedShelves } from "@type/models";

const ListIcons = ({ type }: { type: PredefinedShelves }) => {
    if (type === "favourite")
        return (
            <span className="rounded-full size-full flex flex-cntr-all bg-pink-500 bg-opacity-30">
                <HeartIcon className="text-pink-500 size-[60%]" />
            </span>
        );
    else if (type === "recommended")
        return (
            <span className="rounded-full size-full flex flex-cntr-all bg-sky-500 bg-opacity-30">
                <ThumbUpIcon className="text-sky-500 size-[60%]" />
            </span>
        );
    else if (type === "watched")
        return (
            <span className="rounded-full size-full flex flex-cntr-all bg-orange-500 bg-opacity-30">
                <EyesIcon className="text-orange-500 size-[60%]" />
            </span>
        );
};

export default ListIcons;