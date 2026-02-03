"use client";

import { LeftChevron, ShareIcon, AppIcon } from "@assets/Icons";
import { Navigate, ShareButton } from "@components";
import { twMerge } from "tailwind-merge";
import { OptionalChildren } from "./ui";
import { useTheme } from "next-themes";

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

const Navbar = ({ className = "", onGoBack, OptionButton, navTitle, titleToShare, urlToShare, poster, textToShare }: Props) => {

    const { setTheme, resolvedTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    }

    return (
        <nav className={twMerge("px-2 py-4 sm:px-4 w-full bg-primary z-[2] flex flex-cntr-between sticky top-0 fullScreen", className)}>

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
                <div className="size-6 cursor-pointer" onClick={toggleTheme}>
                    <AppIcon className="size-full" />
                </div>
            </OptionalChildren>

            <div className="flex gap-4 items-center">
                {titleToShare &&
                    <ShareButton
                        title={titleToShare}
                        url={urlToShare}
                        text={textToShare}
                        // poster={poster}
                    >
                        <ShareIcon />
                    </ShareButton>
                }
                {OptionButton}
            </div>
        </nav>
    )
}

export default Navbar;