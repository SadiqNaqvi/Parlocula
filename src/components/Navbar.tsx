import { LeftChevron, ShareIcon } from "@assets/Icons";
import Navigate from "@components/Navigate";
import ShareButton from "./ShareButton";
import { AppIcon } from "@assets/Icons"

type Props = {
    className?: string,
    OptionButton?: React.ReactNode | null,
    navTitle?: string,
    titleToShare?: string,
    urlToShare?: string,
    textToShare?: string,
    poster?: string,
}

const changeTheme = () => {
    const lightTheme = document.body.classList.contains("light");
    if (lightTheme) {
        document.body.classList.remove("light");
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
        document.body.classList.add("light");
    }
}

const Navbar = ({ className = "", OptionButton, navTitle, titleToShare, urlToShare, poster, textToShare }: Props) => (
    <nav className={`${className} px-4 h-14 md:h-16 w-full z-[2] flex flex-cntr-between sticky top-0 bg-primary`}>

        <div className="flex gap-2 items-center">
            <Navigate comp="button" goto="back">
                <LeftChevron />
            </Navigate>
            <p className={`line-clamp-1 ${navTitle ? "opacity-100" : "opacity-0"} text-lg transition-opacity`}>{navTitle}</p>
        </div>
        {!navTitle &&
            <div className="size-8" onClick={changeTheme}>
                <AppIcon className="size-full" />
            </div>}

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