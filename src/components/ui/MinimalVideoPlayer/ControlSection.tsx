import { ExpandIcon, LockIcon, MuteIcon, PauseIcon, PlayIcon, ShrinkIcon, UnlockIcon, VolumeIcon } from "@assets/Icons";
import { PropsWithChildren, useEffect, useRef } from "react";
import Button from "../Button";
import { useGlobalOptions } from "./helpers";

type Func = () => void

const OptionsButton = ({ children, onClick, title }: PropsWithChildren<{ onClick?: Func, title: string }>) => (
    <Button
        title={title}
        className="p-1"
        onClick={onClick}
    >
        {children}
    </Button>
)

const classNameForIcon =  "text-zinc-100 showShadow"

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
            <Button title="Unlock" onClick={toggleScreenLock}>
                <UnlockIcon className={classNameForIcon} />
            </Button>
        </div>
    )

    return (
        <section ref={overlayContainerRef} className={`absolute bottom-0 w-full z-2 mt-auto px-3 ${controlsSeen ? "fade-in" : "fade-out"}`}>
            <div className="flex flex-cntr-between py-2">
                <span>
                    <OptionsButton onClick={togglePlayState} title={playing ? "Pause" : "Play"}>
                        {playing
                            ? <PauseIcon className={classNameForIcon} />
                            : <PlayIcon className={classNameForIcon} />
                        }
                    </OptionsButton>
                </span>
                <span className="flex gap-2">
                    <OptionsButton onClick={handleMute} title={videoRef.current?.muted ? "Unmute" : "Mute"}>
                        {videoRef.current?.muted
                            ? <MuteIcon className={classNameForIcon} />
                            : <VolumeIcon className={classNameForIcon} />
                        }
                    </OptionsButton>

                    <OptionsButton onClick={toggleScreenLock} title="Lock Screen">
                        <LockIcon className={classNameForIcon} />
                    </OptionsButton>

                    <OptionsButton onClick={toggleFullScreen} title={fullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                        {fullScreen
                            ? <ShrinkIcon className={classNameForIcon} />
                            : <ExpandIcon className={classNameForIcon} />
                        }
                    </OptionsButton>
                </span>
            </div>
        </section>
    )
}

export default ControlSection;