import { MereFrame } from "@type/internal";
import FancyImage from "../FancyImage";

const posterOptions = { aspect_ratio: 2 / 3, crop: "thumb", width: 400 }

// const getPosterForFrame = (frames: { path: string, type: "image" | "video" }[]): string => {
//     const poster = { url: "", type: "" };

//     frames.forEach(frame => {
//         if (poster.type === "image" && !poster.url.includes("placeholder")) return;
//         if (frame.type === "image") {
//             poster.type = "image";
//             poster.url = getInternalPoster(frame.uri, posterOptions);
//         } else {
//             poster.type = frame.type;
//             poster.url = getThumbnail(frame.uri);
//         }
//     });

//     return poster.url ? poster.url : placeholder.src;
// }

const FrameTile = ({ frames, spoiler, _id }: MereFrame) => {

    const [thumbnail, ...hiddenFrames] = frames;

    if (!thumbnail) return null

    return (
        <article className={`w-fit relative`} key={_id}>
            {spoiler &&
                <div className="inset-0 absolute z-[1] backdrop-blur-lg backdrop-brightness-50">
                    <div className="size-full flex flex-cntr-all">
                        <p className="text-center text-sm ">This frame may contain spoilers.</p>
                    </div>
                </div>
            }

            <span className="absolute top-0 right-0 mr-2 mt-2 bg-gray-800 text-zinc-200 px-3 py-1 rounded-md">{frames.length}</span>

            <FancyImage alt={`1 image of post ${_id}`} height={300} width={300} id={_id} className="w-full aspect-[2/3] object-cover bg-gray20" src={thumbnail?.path} />

            <div className="hidden">
                {hiddenFrames.map(el => <a key={el.path} href={el.path} data-frame={_id}></a>)}
            </div>
        </article>
    )
}

export default FrameTile;