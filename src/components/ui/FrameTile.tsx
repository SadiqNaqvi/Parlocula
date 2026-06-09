import { Navigate } from "@components";
import { Frame, MereFrame } from "@type/internal";
import OptionalChildren from "./OptionalChildren";
import ParloImage from "./ParloImage/ParloImage";
import ParloVideo from "./ParloVideo/ParloVideo";

const RenderFrame = ({ title, ...frame }: Frame & { title: string }) => {

    if (frame.type === "video") return (
        <ParloVideo
            className="size-full object-cover"
            disablePopup
            hideDuraion
            skipSourceIcon
            frame={frame}
            alt={`Frame of Post - ${title}`}
            containerClassName="size-full"
        />
    )

    return (
        <ParloImage
            containerClassName="size-full"
            frameType="poster"
            frame={frame}
            className="object-cover"
            alt={`Frame of Post - ${title}`}
            fill
        />
    )
}

const FrameTile = ({ frames, spoiler, _id, title, profile }: MereFrame) => {

    const [frame] = frames;
    if (!frame) return null;

    return (
        <Navigate
            historyPayload={{
                title,
                image: frame,
                poster: profile,
                type: "post",
            }}
            goto={`/p/${_id}`}
            type="button"
            comp="link"
            className="size-full"
        >
            <article key={_id} className="size-full relative">

                <OptionalChildren condition={spoiler}>
                    <div className="inset-0 absolute z-1 backdrop-blur-lg backdrop-brightness-50">
                        <div className="size-full flex flex-cntr-all">
                            <span className="text-center text-sm">This frame may contain spoilers.</span>
                        </div>
                    </div>
                </OptionalChildren>

                <RenderFrame title={title} {...frame} />

                <span className="absolute right-0 bottom-0 mr-2 mb-2 bg-black/60 text-zinc-200 px-3 py-1 rounded-md text-sm">{frames.length}</span>
            </article>
        </Navigate>
    )
}

export default FrameTile;