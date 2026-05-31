import { PropsWithChildren, useEffect, useRef } from "react";
import { ExpandIcon, MuteIcon, PauseIcon, PlayIcon, ShrinkIcon, UnlockIcon, VolumeIcon } from "@assets/Icons";
import { useGlobalOptions } from "./helpers";
import InteractiveProgressBar from "./InteractiveProgressBar";

type Func = () => void

const OptionsButton = ({ children, onClick }: PropsWithChildren<{ onClick?: Func }>) => (
    <button className="p-1" onClick={onClick}>
        {children}
    </button>
)

const ControlSection = () => {

    const { setScreenLock, fullScreen, setMessage, controlsSeen, screenLock, setControlsSeen, togglePlayState, playing, videoRef, toggleFullScreen } = useGlobalOptions();

    const overlayContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = overlayContainerRef.current
        if (!container) return;

        if (controlsSeen) {
            container.classList.remove("hidden");
        } else {
            setTimeout(() => {
                container.classList.add("hidden");
            }, 600);
        }
    }, [controlsSeen]);

    const toggleScreenLock = () => {
        if (screenLock)
            setScreenLock(false);
        else {
            setControlsSeen(false);
            setScreenLock(true);
        }
    }

    const handleMute = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.muted)
            setMessage({ label: "Unmuted", icon: "VolumeIcon" })
        else setMessage({ label: "Muted", icon: "MuteIcon" })
        video.muted = !video.muted;
    }

    if (screenLock) return (
        <div className="absolute bottom-0 right-0 mb-4 mr-4 z-2">
            <button onClick={toggleScreenLock}>
                <UnlockIcon />
            </button>
        </div>
    )

    return (
        <section ref={overlayContainerRef} className={`absolute bottom-0 w-full z-2 mt-auto px-3 ${controlsSeen ? "fade-in" : "fade-out"}`}>
            <div className="flex flex-cntr-between py-2">
                <span>
                    <OptionsButton onClick={togglePlayState}>
                        {playing
                            ? <PauseIcon className="text-zinc-100 showShadow" />
                            : <PlayIcon className="text-zinc-100 showShadow" />
                        }
                    </OptionsButton>
                </span>
                <span className="flex gap-2">
                    <OptionsButton onClick={handleMute}>
                        {videoRef.current?.muted
                            ? <MuteIcon className="text-zinc-100 showShadow" />
                            : <VolumeIcon className="text-zinc-100 showShadow" />
                        }
                    </OptionsButton>

                    <OptionsButton onClick={toggleFullScreen}>
                        {fullScreen
                            ? <ShrinkIcon className="text-zinc-100 showShadow" />
                            : <ExpandIcon className="text-zinc-100 showShadow" />
                        }
                    </OptionsButton>
                </span>
            </div>
        </section>
    )
}

export default ControlSection;