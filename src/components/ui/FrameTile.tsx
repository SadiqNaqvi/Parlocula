import { Navigate } from "@components";
import { Frame, MereFrame } from "@type/internal";
import OptionalChildren from "./OptionalChildren";
import ParloImage from "./ParloImage";

const RenderFrame = ({ title, ...frame }: Frame & { title: string }) => {

    if (frame.type === "video") return (
        <video className="size-full object-contain" preload="metadata">
            <source src={frame.path} />
        </video>
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
        <article key={_id}>
            <Navigate
                historyPayload={{
                    title,
                    image: frame,
                    poster: profile,
                    type: "post",
                }}
                goto={`/post/${_id}`}
                type="button"
                comp="link"
                className="relative"
            >

                <OptionalChildren condition={spoiler}>
                    <div className="inset-0 absolute z-1 backdrop-blur-lg backdrop-brightness-50">
                        <div className="size-full flex flex-cntr-all">
                            <span className="text-center text-sm">This frame may contain spoilers.</span>
                        </div>
                    </div>
                </OptionalChildren>

                <div className="w-full aspect-2/3">
                    <RenderFrame title={title} {...frame} />
                </div>

                <span className="absolute top-0 right-0 mr-2 mt-2 bg-gray-800 text-zinc-200 px-3 py-1 rounded-md">{frames.length}</span>
            </Navigate>
        </article>
    )
}

export default FrameTile;