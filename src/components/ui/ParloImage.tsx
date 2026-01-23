"use client"

import { decodeHash } from "@lib/helpers/media";
import { getPoster } from "@lib/utils";
import { Frame } from "@type/internal";
import Image from "next/image";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import OptionalChildren from "./OptionalChildren";
import * as ThumbHash from "thumbhash"

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

const Fallback = ({ className, height, size, width, }: Pick<Props, "height" | "size" | "width" | "className">) => (
    <div style={{ height: height || size, width: width || size }} className={twMerge("bg-gray30 animate-pulse absolute z[1]", className)}></div>
)

const ParloImage = ({ frame, alt, height, size, width, className, containerClassName, skipLazyLoading }: Props) => {
    const [loaded, setLoaded] = useState(false);
    const [decodedHash, setDecodedHash] = useState("data:image/png;base64,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");
    const [isError, setIsError] = useState(false);

    const correctWidth = width || size || 50;
    const correctHeight = height || size || 50;

    // useEffect(() => {
    //     if (frame && typeof frame !== "string")
    //         decodeHash(frame.hash).then(setDecodedHash);
    // }, [frame]);

    if (isError) return (
        <div
            style={{ height: correctHeight, width: correctWidth }}
            className={twMerge("bg-gray40 flex flex-center-all flex-col", className)}
        >⚠</div>
    )


    if (!frame || typeof frame === "string") return (
        <Image
            height={height || size}
            width={width || size}
            src={getPoster({ path: frame })}
            alt={alt || ""}
            className={twMerge(`${size ? `size-[${size}px]` : ''} object-cover`, className)}
            onError={() => setIsError(true)}
        />
    )

    return (
        <div style={{ position: "relative" }} className={containerClassName}>
            <OptionalChildren condition={decodedHash} fallback={<Fallback height={height} width={width} size={size} className={className} />}>
                <Image
                    height={correctHeight}
                    width={correctWidth}
                    src={decodedHash}
                    alt={alt || ""}
                    className={twMerge(`object-cover absolute z-[1] ${loaded ? "opacity-0" : ""}`, className)}
                // className={`object-cover z-[1] absolute`}
                />
            </OptionalChildren>

            <Image
                height={height || size}
                width={width || size}
                src={getPoster({ path: frame.path })}
                loading={skipLazyLoading ? "eager" : "lazy"}
                alt={alt || ""}
                onError={() => setIsError(true)}
                className={twMerge(`${loaded ? '' : "opacity-0"}`, className)}
                // className={twMerge(``, className)}
                onLoad={() => setLoaded(true)}
            />

        </div>
    )

}

export default ParloImage;