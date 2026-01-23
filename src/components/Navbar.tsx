"use client";

import { LeftChevron, ShareIcon } from "@assets/Icons";
import Navigate from "@components/Navigate";
import ShareButton from "./ShareButton";
import { AppIcon } from "@assets/Icons"
import { twMerge } from "tailwind-merge";
import { OptionalChildren } from "./ui";

type Props = {
    className?: string,
    OptionButton?: React.ReactNode | null,
    navTitle?: string,
    titleToShare?: string,
    urlToShare?: string,
    textToShare?: string,
    poster?: string,
    onGoBack?: () => void
}

const changeTheme = () => {

}

const Navbar = ({ className = "", onGoBack, OptionButton, navTitle, titleToShare, urlToShare, poster, textToShare }: Props) => (
    <nav className={twMerge("p-2 sm:p-4 w-full bg-primary z-[2] flex flex-cntr-between sticky top-0", className)}>

        <div className="flex gap-2 items-center">
            {onGoBack ?
                <button onClick={onGoBack}>
                    <LeftChevron />
                </button>
                :
                <Navigate comp="button" goto="back">
                    <LeftChevron />
                </Navigate>
            }
            <span className={`line-clamp-1 text-lg`}>{navTitle}</span>
        </div>
        <OptionalChildren condition={!navTitle}>
            <div className="size-8" onClick={changeTheme}>
                <AppIcon className="size-full" />
            </div>
        </OptionalChildren>

        <div className="flex gap-4 items-center">
            {titleToShare &&
                <ShareButton
                    title={titleToShare}
                    url={urlToShare}
                    text={textToShare}>
                    <ShareIcon />
                </ShareButton>
            }
            {OptionButton}
        </div>
    </nav>
)

export default Navbar;