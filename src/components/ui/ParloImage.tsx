"use client"

import { decodeHash } from "@lib/helpers/media";
import { getPoster } from "@lib/utils";
import { Frame } from "@type/internal";
import Image from "next/image";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

type Props = {
    frame: Frame | string | undefined,
    className?: string,
    containerClassName?: string,
    height?: number,
    width?: number,
    size?: number,
    alt?: string,
    skipLazyLoading?: boolean,
}

const ParloImage = ({ frame, alt, height, size, width, className, containerClassName, skipLazyLoading }: Props) => {
    const [loaded, setLoaded] = useState(false);
    const [decodedHash, setDecodedHash] = useState("");

    useEffect(() => {
        if (frame && typeof frame !== "string")
            decodeHash(frame.hash).then(setDecodedHash);
    }, [frame]);

    if (!frame || typeof frame === "string") return (
        <Image
            height={height || size}
            width={width || size}
            src={getPoster({ path: frame })}
            alt={alt || ""}
            className={twMerge(`${size ? `size-[${size}px]` : ''} object-cover`, className)}
        />
    )

    return (
        <div className={`size-[${size}px] ${containerClassName}`}>
            <Image
                height={height || size}
                width={width || size}
                src={decodedHash}
                alt={alt || ""}
                className={`size-[${size}px] object-cover ${loaded ? "hidden" : "inline"}`}
            />
            <Image
                height={height || size}
                width={width || size}
                src={getPoster({ path: frame.path })}
                loading={skipLazyLoading ? "eager" : "lazy"}
                alt={alt || ""}
                className={twMerge(`${loaded ? "inline" : "hidden"}`, className)}
                onLoadingComplete={() => setLoaded(true)}
            />

        </div>
    )

}

export default ParloImage;