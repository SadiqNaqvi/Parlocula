import { getPoster } from "@lib/utils";
import { generateSnapshot } from "@lib/helpers/media"
import { Frame } from "@type/internal";

export const getVideoPath = (path: string, source: Required<Frame["extSource"]>) => {
    if (source === "youtube")
        return `https://youtube.com/watch?v=${path}`
    else if (source === "vimeo")
        return `https://vimeo.com/${path}`
    else return path;
}

export const getVideoThumb = (path: string, source: Required<Frame["extSource"]>) => {

    if (source === "vimeo") {
        return `/api/v1/vimeo/${path}`;
    }

    else if (source === "youtube")
        return `https://i.ytimg.com/vi/${path}/hqdefault.jpg`

    else return generateSnapshot(path);

}

export const getPathForFrame = (frame: Frame) => {
    if (frame.type === "image")
        return getPoster({ path: frame.path, external: false, extSource: frame.extSource })
    else return getVideoPath(frame.path, frame.extSource)
}

export const getThumbForFrame = (frame: Frame) => {
    if (frame.type === "image")
        return getPoster({ path: frame.path, external: false, extSource: frame.extSource })
    else return getVideoThumb(frame.path, frame.extSource);
}