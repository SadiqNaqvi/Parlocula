"use client";

import { PlayIcon, VimeoIcon, YoutubeIcon } from "@assets/Icons";
import { OptionalChildren, VideoPlayer } from "@components/ui";
import { Fancybox } from "@fancyapps/ui";
import { formatTimeAsDuration } from "@lib/helpers/media";
import { getPathForFrame, getVideoPath } from "@lib/utils/frame";
import { Frame } from "@type/internal";
import Image from "next/image";
import { SyntheticEvent, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

const isEmbeddingFrame = (source: Frame["extSource"]) => {
    return (source === "youtube" || source === "vimeo")
}

const iconClassName = "size-6 showShadow text-zinc-200";

const SourceIconMap = ({ extSource }: Pick<Frame, "extSource">) => {
    if (extSource === "vimeo")
        return <VimeoIcon className={iconClassName} />
    else if (extSource === "youtube")
        return <YoutubeIcon className={iconClassName} />
    else return <PlayIcon className={iconClassName} />
}

type Props = {
    className?: string,
    containerClassName?: string,
    frame: Frame,
    disablePopup?: boolean,
    galleryId?: string,
    alt: string,
    skipSourceIcon?: boolean;
    hideDuraion?: boolean;
}

const ParloVideo = ({ className, containerClassName, frame, disablePopup, galleryId, alt, skipSourceIcon, hideDuraion }: Props) => {

    const [duration, setDuration] = useState('');
    const [play, setPlay] = useState(false);
    const videoContainer = useRef<HTMLDivElement | null>(null);

    if (isEmbeddingFrame(frame.extSource)) return (
        <div
            data-frame={disablePopup ? undefined : galleryId || true}
            data-src={disablePopup ? undefined : getVideoPath(frame.path, frame.extSource)}
            className={twMerge("relative", containerClassName)}
            onContextMenu={e => { e.preventDefault() }}>
            <Image
                fill
                src={getPathForFrame(frame.path, frame.extSource, frame.type)}
                className={className}
                alt={alt}
                unoptimized
            />
            <div className="absolute bottom-4 right-4 flex gap-1 items-center text-zinc-200">
                <SourceIconMap extSource={frame.extSource} />
            </div>

        </div>
    )

    const handleDuration = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        if (hideDuraion) return;
        setDuration(formatTimeAsDuration((e.target as HTMLVideoElement).duration));
    }

    const handleClick = () => {
        if (disablePopup || !videoContainer.current) return;
        setPlay(true);
        Fancybox.show([{
            src: `#${videoContainer.current.id}`,
        }], {
            on: {
                "close": () => {
                    setPlay(false);
                }
            },
            closeButton: false
        })
    }

    return (
        <>
            <div
                className={containerClassName}
                onClick={disablePopup ? undefined : handleClick}
                aria-haspopup
                onContextMenu={e => { e.preventDefault() }}>
                <video
                    className={className}
                    preload="metadata"
                    onLoadedMetadata={handleDuration}
                    disablePictureInPicture
                    title={alt}
                >
                    <source src={frame.path} />
                </video>
                <div className="absolute bottom-4 right-4 flex gap-1 items-center text-zinc-200">
                    <OptionalChildren condition={duration && !hideDuraion}>
                        <span className="px-2 py-1 bg-black/50 text-sm rounded-md">{duration}</span>
                    </OptionalChildren>
                    <OptionalChildren condition={!skipSourceIcon}>
                        <SourceIconMap extSource={frame.extSource} />
                    </OptionalChildren>
                </div>
            </div>
            <OptionalChildren condition={!disablePopup}>
                <div
                    style={{ margin: 0, padding: 0, height: "100%", width: "100%" }}
                    className="hidden"
                    aria-hidden
                    id={`parloVideoPlayer-${Math.random().toString(32).slice(2)}`}
                    ref={videoContainer}
                >
                    <VideoPlayer playState={play} src={frame.path} />
                </div>
            </OptionalChildren >
        </>
    )

}

export default ParloVideo;