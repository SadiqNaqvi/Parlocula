import { LinkIcon } from "@assets/Icons"
import BottomSheet from "@components/BottomSheet"
import Navigate from "@components/Navigate"
import { parloculaAppURL } from "@lib/constants"
import { Link as LinkType } from "@type/internal"
import Link from "next/link"

const LabelAndIcon = ({ label }: { label: string }) => (
    <div className="flex items-center gap-2">
        <span><LinkIcon /></span>
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
            <div className="py-4">
                <h4 className="text-center text-xl mb-2">You are about to be redirected to this path.</h4>
                <p className="text-zinc-500 text-center text-sm">Please make sure, you know this path well before you proceed.</p>
                <Link className="text-sky-500 text-sm my-4" href={path}>{path}</Link>
                <p className="text-zinc-500 text-center text-sm">Click on this path to proceed.</p>
            </div>
        </BottomSheet>
    )
}

export default LinkTile;