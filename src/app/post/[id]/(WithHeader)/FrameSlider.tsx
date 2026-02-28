import { FancyCarousel } from "@components";
import { ParloImage } from "@components/ui"
import { Fancybox } from "@fancyapps/ui"
import { getPoster } from "@lib/utils"
import { Frame } from "@type/internal"

const className = "sm:rounded-md sm:border border-gray40 object-cover";
const containerClassName = "w-full min-w-full h-auto aspect-square sm:w-60 sm:min-w-60";
const sizes = [
    { maxScreenWidth: 480, imageWidth: "100vw" },
    { imageWidth: 240 },
];

const getPath = (path: string, source: Required<Frame["extSource"]>) => {
    if (source === "youtube")
        return `https://youtube.com/watch?v=${path}`
    else if (source === "vimeo")
        return `https://vimeo.com/${path}`
    else return getPoster({ path, external: false, extSource: source })
}

const FrameContainer = (frame: Frame & { id: string }) => {
    const { path, type, extSource } = frame;

    if (extSource === "vimeo" || extSource === "youtube") return (
        <ParloImage
            fill
            frame={frame}
            frameType="poster"
            sizes={sizes}
            fancyGallery={frame.id}
            fullSizeFrame={getPath(frame.path, frame.extSource)}
            className={className}
            containerClassName={containerClassName}
            showSourceIcon
        />
    )

    else if (type === "video") return (
        <div className={containerClassName}>
            <video className={className} preload="metadata">
                <source src={path} />
            </video>
        </div>
    )

    else return (
        <ParloImage
            fill
            frame={frame}
            frameType="poster"
            sizes={sizes}
            className={className}
            fancyGallery={frame.id}
            fullSizeFrame={getPath(frame.path, frame.extSource)}
            showMediaType
            showSize
            containerClassName={containerClassName}
        />
    )

}

const FrameSlider = ({ frames, id }: { frames: Frame[], id: string }) => {

    if (!frames || !frames.length) return null;

    // const enlargeFrame = (index: number) => {
    //     Fancybox.show(
    //         frames.map(({ path, extSource }) => ({
    //             src: getPath(path, extSource)
    //         })),
    //         {
    //             animated: true,
    //             closeButton: false,
    //             dragToClose: true,
    //             Fullscreen: { autoStart: true },
    //             startIndex: index
    //         }
    //     )
    // }

    return (
        <>
            {/* For Mobile devices */}
            <FancyCarousel className="sm:hidden">
                {frames.map(frame => (
                    <li className="f-carousel__slide" key={frame.path}>
                        <FrameContainer id={id} {...frame} />
                    </li>
                ))}
            </FancyCarousel>

            {/* For larger devices */}
            <ul className="hidden sm:flex gap-2 overflow-x-auto noScroll">
                {frames.map(frame => (
                    <li key={frame.path}>
                        <FrameContainer id={id} {...frame} />
                    </li>
                ))}
            </ul>
        </>
    )

}

export default FrameSlider;