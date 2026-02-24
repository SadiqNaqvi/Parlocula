"use client";

import { CollectionIcon, ImageIconFill, ThreadIcon, UserIcon } from "@assets/Icons";
import { backdrop_sizes, logo_sizes, poster_sizes, profile_sizes, still_sizes } from "@lib/constants";
import { decodeHash } from "@lib/helpers/media";
import { getPoster, isEqual } from "@lib/utils";
import { Frame } from "@type/internal";
import { ExternalImageType, ExternalImageTypeToSizeMap } from "@type/other";
import Image from "next/image";
import { twMerge } from "tailwind-merge";

type InternalFrameType = "threadPoster" | "shelfPoster" | "userProfile";
export type ParloImageFrameType = ExternalImageType | InternalFrameType;

type ImageSize = { maxScreenWidth?: number, imageWidth: number | string };

type Props = {
    className?: string,
    containerClassName?: string,
    classNameForFallback?: string;
    commonClassName?: string;
    height?: number,
    width?: number,
    size?: number,
    alt?: string,
    prioritize?: boolean,
    fancyGallery?: string;
    fileNameToDownload?: string;
    frame: string | Frame | undefined;
    frameType: ExternalImageType | InternalFrameType;
    fill?: boolean,
    sizes?: ImageSize[];
}

const turnSizesArrIntoString = (sizes: ImageSize[]) => {
    return sizes
        .sort((a, b) => Number(a.imageWidth) - Number(b.imageWidth))
        .map(
            ({ imageWidth, maxScreenWidth }) => `${maxScreenWidth ? `(max-width: ${maxScreenWidth}px) ` : ''}${imageWidth}${typeof imageWidth === "string" ? '' : "px"}`)
        .join(', ')
}

const getTmdbSizeSet = (type: ExternalImageType) => {
    switch (type) {
        case "backdrop": {
            return backdrop_sizes;
        }
        case "logo": {
            return logo_sizes
        }
        case "poster": {
            return poster_sizes
        }
        case "profile": {
            return profile_sizes
        }
        case "still": {
            return still_sizes
        }
    }
}

const isInternalFrame = (type: ParloImageFrameType): type is Extract<ParloImageFrameType, "userProfile" | "threadPoster"> => {
    return isEqual(type, "userProfile", "threadPoster");
}

const getTmdbSourceSet = (src: string, type: ParloImageFrameType) => {
    if (isInternalFrame(type)) return '';
    const extType = type === "shelfPoster" ? "poster" : type;

    const set = getTmdbSizeSet(extType);

    const widthToSizeMap: Record<number, ExternalImageTypeToSizeMap[typeof extType]> = set
        .filter(size => size !== "original")
        .reduce((prev, size) => ({ ...prev, [Number(size.slice(1))]: size }), {});

    return Array.from(Object.keys(widthToSizeMap))
        .sort()
        .map(key => {
            const size = widthToSizeMap[Number(key)];

            const image = getPoster({ path: src, external: true, size, type: extType });

            return `${image} ${key}w`
        }).join(', ');
}

const getSourceSet = (frame: Frame, sizes: ImageSize[] | undefined) => {
    if (!sizes || !sizes.length || frame.extSource === "youtube" || frame.extSource === "vimeo") return;

    return sizes
        .map(({ imageWidth }) => `/api/v1/optimizeImage?url=${encodeURIComponent(frame.path)}&w=${imageWidth} ${imageWidth}`)
        .join(', ');
}

const FallbackIcon = ({ type, className }: { type: ParloImageFrameType, className?: string; }) => {
    if (type === "shelfPoster") return <CollectionIcon className={twMerge("w-full h-auto max-w-12", className)} />
    else if (type === "threadPoster") return <ThreadIcon className={twMerge("w-full h-auto max-w-12", className)} />
    else if (type === "userProfile") return <UserIcon className={twMerge("w-full h-auto max-w-12", className)} />
    else return <ImageIconFill className={twMerge("w-full h-auto max-w-12", className)} />
}

const getFancyAttributes = (config: Pick<Props, "fancyGallery" | "fileNameToDownload" | "frameType">, src: string | undefined) => {
    const { fileNameToDownload, fancyGallery, frameType } = config;
    if (!fancyGallery || !src) return {};
    const fullSizePath = isInternalFrame(frameType) ? src
        : getPoster({ external: true, type: frameType, size: "original", path: src })

    const source = fullSizePath || src;

    return {
        "data-src": source,
        "data-fancybox": true,
        "data-frame": fancyGallery,
        "data-download-src": fileNameToDownload ? source : undefined,
        "data-download-filename": fileNameToDownload,
    }
}

const ParloImage = ({ frame, alt, height, size, width, className, containerClassName, sizes, classNameForFallback, fill, commonClassName, prioritize, fancyGallery, frameType, fileNameToDownload }: Props) => {

    if (!frame) return (
        <div className={twMerge("p-2 bg-gray10 flex flex-cntr-all", className)}>
            <FallbackIcon
                type={frameType}
                className={twMerge(commonClassName, classNameForFallback)}
            />
        </div>
    )

    const isTmdbImage = typeof frame === "string";
    const source = isTmdbImage ? frame : frame.path;

    const correctWidth = width || size || 50;
    const correctHeight = height || size || 50;

    if (isTmdbImage) return (
        <div className={containerClassName}>
            <img
                height={fill ? undefined : correctHeight}
                width={fill ? undefined : correctWidth}
                src={getPoster({ path: source, type: frameType as ExternalImageType, external: true, size: "original" })}
                loading={prioritize ? "eager" : "lazy"}
                fetchPriority={prioritize ? "high" : "low"}
                alt={alt || ""}
                srcSet={isTmdbImage ? getTmdbSourceSet(source, frameType) : getSourceSet(frame, sizes)}
                className={twMerge(`cursor-pointer`, commonClassName, className)}
                {...getFancyAttributes({ frameType, fancyGallery, fileNameToDownload }, source)}
                crossOrigin="anonymous"
                decoding={prioritize ? "sync" : "async"}
                sizes={sizes ? turnSizesArrIntoString(sizes) : `${correctWidth}px`}
            />
        </div>
    )

    return (
        <div className={containerClassName}>
            <Image
                height={fill ? undefined : correctHeight}
                width={fill ? undefined : correctWidth}
                src={getPoster({ path: source, extSource: frame.extSource })}
                loading={prioritize ? "eager" : "lazy"}
                fetchPriority={prioritize ? "high" : "low"}
                alt={alt || ""}
                fill={fill}
                className={twMerge(`cursor-pointer`, commonClassName, className)}
                blurDataURL={!isTmdbImage && frame.hash ? decodeHash(frame.hash) : undefined}
                placeholder={!isTmdbImage && frame.hash ? "blur" : "empty"}
                {...getFancyAttributes({ frameType, fancyGallery, fileNameToDownload }, source)}
                crossOrigin="anonymous"
                decoding={prioritize ? "sync" : "async"}
                sizes={sizes ? turnSizesArrIntoString(sizes) : `${correctWidth}px`}
            />

        </div>
    )
}

export default ParloImage;