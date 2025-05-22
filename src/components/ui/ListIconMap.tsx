import { BookmarkIcon, EyesIcon, HeartIcon, ShushIcon, ThumbUpIcon } from "@assets/Icons";

const ListIcons = ({ type }: { type: string }) => {
    if (type === "favourite")
        return (
            <span className="rounded-full size-full bg-pink-500 bg-opacity-30">
                <HeartIcon className="text-pink-500" />
            </span>
        );
    else if (type === "recommended")
        return (
            <span className="rounded-full size-full bg-sky-500 bg-opacity-30">
                <ThumbUpIcon className="text-sky-500" />
            </span>
        );
    else if (type === "saved")
        return (
            <span className="rounded-full size-full bg-green-500 bg-opacity-30">
                <BookmarkIcon className="text-green-500" />
            </span>
        );
    else if (type === "private")
        return (
            <span className="rounded-full size-full bg-purple-500 bg-opacity-30">
                <ShushIcon className="text-purple-500" />
            </span>
        );
    else if (type === "watched")
        return (
            <span className="rounded-full size-full bg-orange-500 bg-opacity-30">
                <EyesIcon className="text-orange-500" />
            </span>
        );
};

export default ListIcons;