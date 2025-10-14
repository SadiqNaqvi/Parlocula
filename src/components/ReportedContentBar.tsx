import { ReportedContent } from "@type/internal";
import Image from "next/image";
import { PropsWithChildren } from "react";
import FramesCarousel from "./FramesCarousel";
import Navigate from "./Navigate";

const ReasonTiles = ({ reasons, total }: Pick<ReportedContent, "reasons" | "total">) => {
    return (
        <ul className="flex gap-2 overflow-x-auto noScroll">
            <li className="px-2 py-1 rounded-xl bg-gray30">Total: {total}</li>
            {Object.entries(reasons).map(([r, f]) => (
                <li className="w-fit space-x-2 px-2 py-1 rounded-xl border border-gray30">
                    <span>{r}</span>
                    <span>{f}</span>
                </li>
            ))}
        </ul>
    )
}

const ContentBar = ({ content, content_type }: ReportedContent) => {

    if (content_type === "comment") return (
        <>
            {content.content && (
                <div className="flex-1">
                    <p>{content.content}</p>
                </div>
            )}
            {content.attachment && (
                <Image
                    height={300}
                    width={300}
                    className="size-[300] rounded-md border border-gray-500"
                    src={content.attachment}
                    alt="Attachemnt"
                />
            )}
        </>
    )

    return (
        <>
            <div className="space-y-2 flex-1">
                <h4>{content.title}</h4>
                <ul className="flex gap-2">
                    <li className="p-1 bg-gray-30">{content.tag}</li>
                    {content.nsfw && <li className="p-1 bg-purple-500 bg-opacity-30">NSFW</li>}
                    {content.spoiler && <li className="p-1 bg-orange-500 bg-opacity-30">NSFW</li>}
                </ul>
            </div>
            <FramesCarousel frames={content.frames} />
        </>

    )
}

const ReportedContentBar = ({ content, children }: PropsWithChildren<{ content: ReportedContent }>) => {

    return (
        <article className="p-2 my-2">
            <Navigate comp="link" goto={`/${content.content_type}/${content._id}/reports`}>
                <div className="flex gap-4 flex-col sm:flex-row">
                    <ContentBar {...content} />
                </div>
            </Navigate>
            <ReasonTiles reasons={content.reasons} total={content.total} />
            {content.content.warnedOn && (
                <p className="my-2 text-sm text-center">The author of this {content.content_type} has been already warned on {new Date(content.content.warnedOn).toLocaleString()}</p>
            )}
            {children}
        </article>
    )
}

export default ReportedContentBar;