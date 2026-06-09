import React, { forwardRef } from "react";
import { useGlobalOptions } from "./helpers";

type Props = {
    src: string;
    startMute: boolean | undefined;
    poster: string | undefined;
}

const VideoElement = forwardRef<HTMLVideoElement, Props>(({ poster, src, startMute }, ref) => {
    const { buffering, screenLock, controlsSeen, setPlaying } = useGlobalOptions();
    return (
        <div className={`size-full z-0 ${(controlsSeen || buffering) && !screenLock ? "transition-all duration-500 brightness-50" : ''}`}>
            <video
                ref={ref}
                src={src}
                muted={startMute}
                poster={poster}
                disablePictureInPicture
                disableRemotePlayback
                className="size-full z-0 object-contain max-h-dvh"
                preload="metadata"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
            />
        </div>
    )
});

VideoElement.displayName = "VideoElement";

export default React.memo(VideoElement);