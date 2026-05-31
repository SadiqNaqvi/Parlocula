"use client";

import { CollectionIcon, GlobeIcon, ImageIconFill, MegaIcon, PlayIcon, GroupIcon, UserIcon, VimeoIcon, YoutubeIcon, UserWithoutCircleIcon } from "@assets/Icons";
import { backdrop_sizes, logo_sizes, poster_sizes, profile_sizes, still_sizes } from "@lib/constants";
import { convertByteIntoSize, decodeHash } from "@lib/helpers/media";
import { getPoster, isEqual } from "@lib/utils";
import { Frame } from "@type/internal";
import { ExternalImageType, ExternalImageTypeToSizeMap } from "@type/other";
import Image from "next/image";
import { twMerge } from "tailwind-merge";
import OptionalChildren from "./OptionalChildren";

type InternalFrameType = "groupPoster" | "shelfPoster" | "userProfile";
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
    frame: string | Frame | undefined;
    frameType: ExternalImageType | InternalFrameType;
    fullSizeFrame?: string;
    fancyGallery?: string;
    fileNameToDownload?: string;
    fill?: boolean,
    sizes?: ImageSize[];
    showMediaType?: boolean;
    showSourceIcon?: boolean;
    showSize?: boolean;
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

const isInternalFrame = (type: ParloImageFrameType): type is Extract<ParloImageFrameType, "userProfile" | "groupPoster"> => {
    return isEqual(type, "userProfile", "groupPoster");
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
    if (type === "shelfPoster") return <CollectionIcon className={twMerge("w-full h-auto max-w-10", className)} />
    else if (type === "groupPoster") return <GroupIcon className={twMerge("w-full h-auto max-w-10", className)} />
    else if (type === "userProfile") return <UserWithoutCircleIcon className={twMerge("w-full h-auto max-w-10", className)} />
    else return <ImageIconFill className={twMerge("w-full h-auto max-w-10", className)} />
}

const getFancyAttributes = (config: Pick<Props, "fancyGallery" | "fileNameToDownload" | "frameType" | "fullSizeFrame">, src: string | undefined) => {
    const { fileNameToDownload, fancyGallery, frameType, fullSizeFrame } = config;
    if (!fancyGallery || !src) return {};
    const source = fullSizeFrame || (isInternalFrame(frameType) ? src : getPoster({ external: true, type: frameType, size: "original", path: src }));

    return {
        "data-src": source,
        "parlo-gallery": fancyGallery,
        "data-frame": true,
        "data-download-src": fileNameToDownload ? source : undefined,
        "data-download-filename": fileNameToDownload,
    }
}

const iconClassName = "size-6 frameIconShadow text-zinc-200";

const ParloImage = ({ frame, alt, height, size, width, className, containerClassName, fullSizeFrame, sizes, classNameForFallback, fill, commonClassName, prioritize, fancyGallery, frameType, fileNameToDownload, showMediaType, showSize, showSourceIcon }: Props) => {

    if (!frame) return (
        <div className={twMerge("p-2 bg-gray10 flex flex-cntr-all", fill ? '' : "min-w-fit", containerClassName)}>
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
        <div className={twMerge(fill ? '' : "min-w-fit", containerClassName)}>
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
                // crossOrigin="anonymous"
                decoding={prioritize ? "sync" : "async"}
                sizes={sizes ? turnSizesArrIntoString(sizes) : `${correctWidth}px`}
            />
        </div>
    )

    return (
        <div className={twMerge("relative overflow-hidden", fill ? '' : "min-w-fit", containerClassName)}>
            <Image
                height={fill ? undefined : correctHeight}
                width={fill ? undefined : correctWidth}
                src={getPoster({ path: source, extSource: frame.extSource })}
                loading={prioritize ? "eager" : "lazy"}
                fetchPriority={prioritize ? "high" : "low"}
                alt={alt || ""}
                fill={fill}
                className={twMerge(`cursor-pointer`, commonClassName, className)}
                blurDataURL={frame.hash ? decodeHash(frame.hash) : undefined}
                placeholder={frame.hash ? "blur" : "empty"}
                {...getFancyAttributes({ frameType, fancyGallery, fileNameToDownload, fullSizeFrame }, source)}
                // crossOrigin="anonymous"
                decoding={prioritize ? "sync" : "async"}
                sizes={sizes ? turnSizesArrIntoString(sizes) : `${correctWidth}px`}
            />
            <OptionalChildren condition={showSize || showMediaType || showSourceIcon}>
                <div className="absolute bottom-4 right-4 flex gap-1 items-center text-zinc-200">
                    <OptionalChildren condition={showSize && frame.size}>
                        <span className="px-2 py-1 bg-black/50 text-sm rounded-md">{convertByteIntoSize(frame.size)}</span>
                    </OptionalChildren>
                    <OptionalChildren condition={showMediaType}>
                        <ImageIconFill className={iconClassName} />
                    </OptionalChildren>
                </div>
            </OptionalChildren>
        </div>
    )
}

export default ParloImage;