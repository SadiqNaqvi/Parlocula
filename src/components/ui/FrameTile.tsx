import { Navigate, FramesCarousel } from "@components";
import { MereFrame } from "@type/internal";

const FrameTile = ({ frames, spoiler, _id }: MereFrame) => {

    return (
        <article key={_id}>
            <Navigate goto={`/post/${_id}`} type="button" comp="link" className="relative">

                {spoiler && (
                    <div className="inset-0 absolute z-[1] backdrop-blur-lg backdrop-brightness-50">
                        <div className="size-full flex flex-cntr-all">
                            <span className="text-center text-sm">This frame may contain spoilers.</span>
                        </div>
                    </div>
                )}

                <div className="w-full aspect-[2/3]">
                    <FramesCarousel frames={frames} />
                </div>

                <span className="absolute top-0 right-0 mr-2 mt-2 bg-gray-800 text-zinc-200 px-3 py-1 rounded-md">{frames.length}</span>
            </Navigate>
        </article>
    )
}

export default FrameTile;