import { getInternalPoster, getThumbnail } from "@lib/utils";
import { MereFrame } from "@type/internal";
import placeholder from "@assets/placeholder.png";

const posterOptions = { aspect_ratio: 2 / 3, crop: "thumb", width: 400 }

const getPosterForFrame = (frames: { uri: string, type: "image" | "video" }[]): string => {
    const poster = { url: "", type: "" };

    frames.forEach(frame => {
        if (poster.type === "image" && !poster.url.includes("placeholder")) return;
        if (frame.type === "image") {
            poster.type = "image";
            poster.url = getInternalPoster(frame.uri, posterOptions);
        } else {
            poster.type = frame.type;
            poster.url = getThumbnail(frame.uri);
        }
    });

    return poster.url ? poster.url : placeholder.src;
}

const FrameTile = ({ spoiler }: { spoiler: boolean }) => {
    return (
        // <div className={`${nsfw ? "hidden" : "inline"}`}>
        <div className={`relative`}>
            {spoiler &&
                <div className="inset-0 absolute z-[1] backdrop-blur-lg backdrop-brightness-50">
                    <div className="size-full flex flex-cntr-all">
                        <p className="text-center text-sm ">This frame may contain spoilers.</p>
                    </div>
                </div>
            }
            <img className="aspect-[2/3] w-full object-contain bg-gray20" src={placeholder.src} />
        </div>
    )
}

export default FrameTile;