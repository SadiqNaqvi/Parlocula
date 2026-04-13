"use client";

import { AppIcon, LeftChevron } from "@assets/Icons";
import { ShareButton } from "@components";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { twMerge } from "tailwind-merge";
import { OptionalChildren } from "./ui";

type Props = {
    className?: string,
    OptionButton?: React.ReactNode | null,
    navTitle?: string,
    titleToShare?: string,
    urlToShare?: string,
    onGoBack?: () => void,
    hrefToRedirect?: string,
    hideAppIcon?: boolean;
}

const Navbar = ({ className = "", onGoBack, OptionButton, navTitle, titleToShare, urlToShare, hrefToRedirect, hideAppIcon }: Props) => {

    const { setTheme, resolvedTheme } = useTheme();
    const router = useRouter();

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    }

    const goBack = () => {
        if (hrefToRedirect) {
            router.replace(hrefToRedirect);
        } else {
            router.back();
        }
    }

    return (
        <nav className={twMerge("px-2 py-4 sm:px-4 w-full bg-primary z-4 flex flex-cntr-between sticky top-0 fullScreen", className)}>

            <div className="flex gap-2 items-center">

                <OptionalChildren
                    condition={!!onGoBack}
                    fallback={(
                        <button onClick={goBack}>
                            <LeftChevron />
                        </button>
                    )}
                >
                    <button onClick={onGoBack}>
                        <LeftChevron />
                    </button>
                </OptionalChildren>
                <OptionalChildren condition={navTitle}>
                    <span className={`line-clamp-1 text-lg`}>{navTitle}</span>
                </OptionalChildren>
            </div>

            <OptionalChildren condition={!navTitle && !hideAppIcon}>
                <div className="absolute mt-6 left-[50%] -translate-[50%] size-6 cursor-pointer" onClick={toggleTheme}>
                    <AppIcon className="size-full" />
                </div>
            </OptionalChildren>


            <div className="flex gap-4 items-center">
                <OptionalChildren condition={titleToShare}>
                    <ShareButton title={titleToShare} url={urlToShare!} />
                </OptionalChildren>

                {OptionButton}

            </div>
        </nav>
    )
}

export default Navbar;