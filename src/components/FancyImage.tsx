"use client";

import { getInternalPoster, getThumbnail } from "@lib/utils";
import Image from "next/image";

type Props = {
    src: string,
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
};

const FancyImage = ({ src, id, download, caption, alt, height, width, type = "image", thumbnail, containerClass, ...args }: Props) => {

    const source = getInternalPoster({ path: src, type });

    return (
        <div
            className={containerClass ?? "size-fit"}
            style={{ cursor: "pointer" }}
            key={src}
            data-src={source}
            data-frame={id}
            data-download-src={download ? source : undefined}
            data-download-filename={download}
            data-caption={caption}>
            {type === "image" ?
                <Image
                    {...args}
                    priority={false}
                    loading="lazy"
                    data-lazy-src={thumbnail ?? source}
                    src={thumbnail ?? source}
                    alt={alt}
                    height={height}
                    width={width} />
                :
                <video
                    {...args}
                    height={height}
                    width={width}
                    preload="metadata"
                    poster={getThumbnail(src)}>
                    <source src={source} />
                </video>
            }
        </div>
    )
}

export default FancyImage;