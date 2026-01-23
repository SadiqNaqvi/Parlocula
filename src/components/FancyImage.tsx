"use client";

import { getPoster, getThumbnail } from "@lib/utils";
import Image from "next/image";
import { ParloImage } from "./ui";
import { Frame } from "@type/internal";
import { twMerge } from "tailwind-merge";

type Props = {
    src: Frame | string,
    id: string,
    alt: string,
    height: number,
    width: number,
    thumbnail?: string,
    download?: string,
    caption?: string,
    type?: "image" | "video",
    className?: string,
    containerClass?: string,
}

const FancyImage = ({ id, download, caption, alt, src, height, width, type = "image", thumbnail, containerClass, className, ...args }: Props) => {

    const source = typeof src === "string" ? src : src.path;

    return (
        <div
            className={twMerge("size-fit", containerClass)}
            style={{ cursor: "pointer" }}
            key={source}
            data-src={source}
            data-fancybox={id}
            data-frame
            data-download-src={download ? source : undefined}
            data-download-filename={download}
            data-caption={caption}>
            {type === "image" ?
                <ParloImage
                    data-lazy-src={thumbnail ?? source}
                    frame={thumbnail ?? source}
                    alt={alt}
                    height={height}
                    width={width}
                    className={className}
                />
                :
                <video
                    {...args}
                    className={className}
                    height={height}
                    width={width}
                    preload="metadata"
                    poster={getThumbnail(source)}>
                    <source src={source} />
                </video>
            }
        </div>
    )
}

export default FancyImage;