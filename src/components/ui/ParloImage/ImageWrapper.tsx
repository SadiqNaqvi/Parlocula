"use client";
import { twMerge } from "tailwind-merge";
import type { ParloImageProps } from "./ParloImage";
import type { PropsWithChildren } from "react";

const ImageWrapper = ({ children, fill, containerClassName }: PropsWithChildren<Pick<ParloImageProps, "containerClassName" | "fill">>) => (
    <div
        onContextMenu={e => e.preventDefault()}
        className={twMerge("relative overflow-hidden", fill ? '' : "min-w-fit", containerClassName)}
    >
        {children}
    </div>
)

export default ImageWrapper;