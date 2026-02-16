"use client";

import { CollectionIcon, ImageIconFill, ThreadIcon, UserIcon } from "@assets/Icons";
import { decodeHash } from "@lib/helpers/media";
import { getPoster, isEqual } from "@lib/utils";
import { Frame } from "@type/internal";
import { ExternalImageType } from "@type/other";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

type InternalFrameType = "threadPoster" | "shelfPoster" | "userProfile";
type FrameType = ExternalImageType | InternalFrameType;

type Props = {
    frame: Frame | string | undefined,
    className?: string,
    containerClassName?: string,
    height?: number,
    width?: number,
    size?: number,
    alt?: string,
    prioritize?: boolean,
    fancyGallery?: string;
    fileNameToDownload?: string;
    frameType: FrameType;
}

const FallbackIcon = ({ type }: { type: FrameType }) => {
    if (type === "shelfPoster") return <CollectionIcon className="w-full h-auto max-w-12" />
    else if (type === "threadPoster") return <ThreadIcon className="w-full h-auto max-w-12" />
    else if (type === "userProfile") return <UserIcon className="w-full h-auto max-w-12" />
    else return <ImageIconFill className="w-full h-auto max-w-12" />
}

const getFancyAttributes = (config: Pick<Props, "fancyGallery" | "fileNameToDownload" | "frameType"> | undefined, src: string | undefined) => {
    if (!config || !src) return {};
    const { fileNameToDownload, fancyGallery, frameType } = config;
    const fullSizePath = isEqual(frameType, "shelfPoster", "threadPoster", "userProfile") ?
        src
        : getPoster({ external: true, type: frameType as ExternalImageType, size: "original", path: src })
    const source = fullSizePath || src;
    return {
        "data-src": source,
        "data-fancybox": true,
        "data-frame": fancyGallery,
        "data-download-src": fileNameToDownload ? source : undefined,
        "data-download-filename": fileNameToDownload,
    }
}

const ParloImage = ({ frame, alt, height, size, width, className, containerClassName, prioritize, fancyGallery, frameType, fileNameToDownload }: Props) => {

    const source = !frame || typeof frame === "string" ? frame : frame.path;
    const isExternal = typeof frame === "string" || frame?.isExternal;

    const correctWidth = width || size || 50;
    const correctHeight = height || size || 50;

    if (!frame) return (
        <div className={twMerge("p-2 bg-gray10 flex flex-cntr-all", className)}>
            <FallbackIcon type={frameType} />
        </div>
    )

    return (
        <div className={containerClassName}>
            <Image
                height={correctHeight}
                width={correctWidth}
                src={getPoster({ path: source })}
                loading={prioritize ? "eager" : "lazy"}
                alt={alt || ""}
                loader={isExternal ? ({ src }) => src : undefined}
                className={twMerge(`cursor-pointer`, className)}
                blurDataURL={frame && !isExternal ? decodeHash(frame.hash) : undefined}
                {...getFancyAttributes({ frameType, fancyGallery, fileNameToDownload }, source)}
            />

        </div>
    )
}

export default ParloImage;