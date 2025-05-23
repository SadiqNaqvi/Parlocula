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

const Navbar = ({ className = "", OptionButton, navTitle, titleToShare, urlToShare, poster, textToShare }: Props) => (
    <nav className={`${className} h-14 md:h-16 w-full z-[2] flex flex-cntr-between sticky top-0 bg-primary`}>

        <div className="flex gap-2 items-center">
            <Navigate comp="button" goto="back" className="iconBtn">
                <LeftChevron />
            </Navigate>
            <p className={`line-clamp-1 ${navTitle ? "opacity-100" : "opacity-0"} text-lg transition-opacity`}>{navTitle}</p>
        </div>

        <div className="size-12">
            <AppIcon className="size-full" />
        </div>

        <div className="flex gap-4 items-center">
            {titleToShare &&
                <ShareButton
                    title={titleToShare}
                    url={urlToShare}
                    text={textToShare}
                    className="iconBtn">
                    <ShareIcon />
                </ShareButton>
            }
            {OptionButton}
        </div>
    </nav>
)

export default Navbar;