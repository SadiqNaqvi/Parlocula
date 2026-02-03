import { LinkIcon, RightChevron } from "@assets/Icons"
import BottomSheet from "@components/BottomSheet"
import Navigate from "@components/Navigate"
import { parloculaAppURL } from "@lib/constants"
import { Link as LinkType } from "@type/internal"
import Link from "next/link"

const LabelAndIcon = ({ label }: { label: string }) => (
    <div className="flex items-center gap-2 px-2 py-1 bg-gray10 rounded-md border border-gray30 whitespace-nowrap text-nowrap">
        <span><LinkIcon className="size-4" /></span>
        <span>{label}</span>
    </div>
);

const LinkTile = ({ label, path }: LinkType) => {

    if (path.startsWith('/') || new URL(parloculaAppURL).origin === new URL(path).origin) return (
        <Navigate comp="link" goto={path}>
            <LabelAndIcon label={label} />
        </Navigate>
    )

    return (
        <BottomSheet button={<LabelAndIcon label={label} />}>
            <div className="p-4">
                <h4 className="text-center text-lg mb-2">You are about to be redirected to this path.</h4>
                <p className="text-zinc-500 text-center text-sm">Please make sure, you know this path well before you proceed.</p>
                <div className="my-4 border border-gray20 bg-gray10 rounded-md p-2">
                    <Link className="text-sky-500 text-sm flex gap-2 flex-cntr-between" href={path}>
                        <span>{path}</span>
                        <RightChevron />
                    </Link>
                </div>
                <p className="text-zinc-500 text-center text-sm">Click on this path to proceed.</p>
            </div>
        </BottomSheet >
    )
}

export default LinkTile;