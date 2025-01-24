import { Ellipsis, LeftChevron, ShareIcon } from "@assets/Icons";
import Navigate from "@components/Navigate";

export default function Navbar({ classnames = "" }: { classnames?: string }) {
    return (
        <nav className={`${classnames} h-14 md:h-16 w-full z-[2] fixed top-0 backdrop-brightness-[0.6] flex flex-cntr-between`}>
            <Navigate comp="button" goto="back" className="iconBtn">
                <LeftChevron />
            </Navigate>
            <span className="flex gap-4">
                <button className="iconBtn"><ShareIcon /></button>
                <button className="iconBtn"><Ellipsis /></button>
            </span>
        </nav>
    )
}