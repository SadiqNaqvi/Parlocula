"use client";

import { AppIcon, LeftChevron, ShareIcon } from "@assets/Icons";
import { Navigate, ShareButton } from "@components";
import { useNavigation } from "@store/historystack";
import { useTheme } from "next-themes";
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
    onGoBack?: () => void,
    hrefToRedirect?: string,
}

const Navbar = ({ className = "", onGoBack, OptionButton, navTitle, titleToShare, urlToShare, poster, textToShare, hrefToRedirect }: Props) => {

    const { setTheme, resolvedTheme } = useTheme();
    const router = useNavigation();

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    }

    const handleReplace = (e: any) => {
        if (!hrefToRedirect) return;

        e.preventDefault();

        router.replace(hrefToRedirect);
    }

    return (
        <nav className={twMerge("px-2 py-4 sm:px-4 w-full bg-primary z-2 flex flex-cntr-between sticky top-0 fullScreen", className)}>

            <div className="flex gap-2 items-center">

                <OptionalChildren
                    condition={!!onGoBack}
                    fallback={(
                        <Navigate comp="button" goto="back" onClick={handleReplace}>
                            <LeftChevron />
                        </Navigate>
                    )}
                >
                    <button onClick={onGoBack}>
                        <LeftChevron />
                    </button>
                </OptionalChildren>

                <OptionalChildren
                    condition={!navTitle}
                    fallback={(
                        <span className={`line-clamp-1 text-lg`}>{navTitle}</span>
                    )}
                >
                    <div className="size-6 cursor-pointer" onClick={toggleTheme}>
                        <AppIcon className="size-full" />
                    </div>
                </OptionalChildren>
            </div>


            <div className="flex gap-4 items-center">
                <OptionalChildren condition={titleToShare}>
                    <ShareButton
                        title={titleToShare!}
                        url={urlToShare}
                        text={textToShare}
                    // poster={poster}
                    >
                        <ShareIcon />
                    </ShareButton>
                </OptionalChildren>

                {OptionButton}

            </div>
        </nav>
    )
}

export default Navbar;