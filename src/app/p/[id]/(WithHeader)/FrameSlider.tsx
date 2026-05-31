"use client";

import FancyCarousel from "@components/FancyCarousel";
import { ParloVideo } from "@components/ui";
import ParloImage from "@components/ui/ParloImage";
import { getPoster } from "@lib/utils";
import { Frame } from "@type/internal";

const className = "sm:rounded-md sm:border border-gray40 object-cover object-center size-full";
const containerClassName = "w-full min-w-full h-auto aspect-square sm:w-60 sm:min-h-60 sm:min-w-60";
const sizes = [
    { maxScreenWidth: 480, imageWidth: "100vw" },
    { imageWidth: 240 },
];

const FrameContainer = ({ disablePopping, index, ...frame }: Frame & { index: number, disablePopping?: boolean }) => {
    const { path, type, extSource } = frame;

    if (extSource === "vimeo" || extSource === "youtube" || type === "video") return (
        <ParloVideo
            className={className}
            containerClassName={containerClassName}
            frame={frame}
            disablePopup={disablePopping}
            alt={`Frame Slide Number ${index} of the Post - A video`}
        />
    )

    else return (
        <ParloImage
            fill
            frame={frame}
            frameType="poster"
            sizes={sizes}
            className={className}
            fullSizeFrame={disablePopping ? undefined : getPoster({ path, external: false, extSource })}
            showMediaType
            showSize
            containerClassName={containerClassName}
            alt={`Frame Slide Number ${index} of the Post - An image`}
        />
    )

}

const FrameSlider = ({ frames, disablePopping }: { frames: Frame[], id: string, disablePopping?: boolean }) => {

    if (!frames || !frames.length) return null;

    return (
        <FancyCarousel>
            {frames.map((frame, ind) => (
                <li
                    className="f-carousel__slide"
                    key={frame.path}>
                    <FrameContainer
                        index={ind}
                        disablePopping={disablePopping}
                        {...frame}
                    />
                </li>
            ))}
        </FancyCarousel>
    )

}

export default FrameSlider;