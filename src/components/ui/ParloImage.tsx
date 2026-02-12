import { decodeHash } from "@lib/helpers/media";
import { getPoster } from "@lib/utils";
import { Frame } from "@type/internal";
import Image, { ImageLoader } from "next/image";
import { twMerge } from "tailwind-merge";

type FancyProps = {
    gallery?: string;
    fileNameToDownload?: string;
    caption?: string;
    fullSizePath?: string;
}

type Props = {
    frame: Frame | string | undefined,
    className?: string,
    containerClassName?: string,
    height?: number,
    width?: number,
    size?: number,
    alt?: string,
    prioritize?: boolean,
    fancy?: FancyProps;
    loader?: ImageLoader;
}

const getFancyAttributes = (config: FancyProps | undefined, src: string | undefined) => {
    if (!config || !src) return {};
    const { caption, fileNameToDownload, gallery, fullSizePath } = config;
    const source = fullSizePath || src;
    return {
        "data-src": source,
        "data-fancybox": gallery,
        "data-frame": gallery,
        "data-download-src": fileNameToDownload ? source : undefined,
        "data-download-filename": fileNameToDownload,
        "data-caption": caption,
    }
}

const ParloImage = ({ frame, alt, height, size, width, className, containerClassName, prioritize, fancy, loader }: Props) => {

    const source = !frame ? undefined : typeof frame === "string" ? frame : frame.path;

    const correctWidth = width || size || 50;
    const correctHeight = height || size || 50;

    return (
        <div className={containerClassName}>
            <Image
                height={correctHeight}
                width={correctWidth}
                src={getPoster({ path: source })}
                loading={prioritize ? "eager" : "lazy"}
                alt={alt || ""}
                loader={loader}
                className={twMerge(`cursor-pointer`, className)}
                blurDataURL={frame && typeof frame !== "string" ? decodeHash(frame.hash) : undefined}
                {...getFancyAttributes(fancy, source)}
            />

        </div>
    )
}

export default ParloImage;