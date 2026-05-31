"use client";

import { PlayIcon, VimeoIcon, YoutubeIcon } from "@assets/Icons";
import { OptionalChildren, VideoPlayer } from "@components/ui";
import { formatTimeAsDuration } from "@lib/helpers/media";
import { getPathForFrame } from "@lib/utils/frame";
import { Frame } from "@type/internal";
import Image from "next/image";
import { SyntheticEvent, useState } from "react";

const isEmbeddingFrame = (source: Frame["extSource"]) => {
    return (source === "youtube" || source === "vimeo")
}

const iconClassName = "size-6 frameIconShadow text-zinc-200";

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
}

const ParloVideo = ({ className, containerClassName, frame, disablePopup, galleryId, alt }: Props) => {

    const [duration, setDuration] = useState('');

    if (isEmbeddingFrame(frame.extSource)) return (
        <div
            data-frame={disablePopup ? undefined : galleryId}
            data-src={disablePopup ? undefined : getPathForFrame(frame)}
            className={containerClassName}
            onContextMenu={e => { e.preventDefault() }}>
            <Image
                fill
                src={getPathForFrame(frame)}
                className={className}
                alt={alt}
            />
            <div className="absolute bottom-4 right-4 flex gap-1 items-center text-zinc-200">
                <SourceIconMap extSource={frame.extSource} />
            </div>

        </div>
    )

    const handleDuration = (e: SyntheticEvent<HTMLVideoElement, Event>) => {
        setDuration(formatTimeAsDuration((e.target as HTMLVideoElement).duration));
    }

    return (
        <>
            <div
                data-frame={disablePopup ? undefined : galleryId || true}
                data-src={disablePopup ? undefined : "#parloVideoPlayer"}
                className={containerClassName}
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
                    <OptionalChildren condition={duration}>
                        <span className="px-2 py-1 bg-black/50 text-sm rounded-md">{duration}</span>
                    </OptionalChildren>
                    <SourceIconMap extSource={frame.extSource} />
                </div>
            </div>
            <OptionalChildren condition={!disablePopup}>
                <div style={{ margin: 0, padding: 0, height: "100%", width: "100%" }} className="hidden" id="parloVideoPlayer">
                    <VideoPlayer src={frame.path} />
                </div>

            </OptionalChildren>
        </>
    )

}

export default ParloVideo;