"use client";

import { usePathname } from "next/navigation";
import { LeftChevron } from "@assets/Icons";
// import LoadingSpinner from "@assets/components/ui/LoadingSpinner";

const getNameFromPath = (url) => {
    return url.split('-').filter((e, i) => i !== 0 && e).join(' ');
}

const Loading = () => {
    const name = getNameFromPath(usePathname());

    return (
        <div className="">
            <div className="h-14 md:h-16 flex gap-4 items-center -mt-4 mb-4">
                <LeftChevron />
                <h1 className="text-2xl">{name}</h1>
            </div>
            {/* <LoadingSpinner /> */}
        </div>
    )
}

export default Loading;